/**
 * Proposes and generates brand-new trade assemblies with Gemini, offline.
 *
 *   npm run textbook:expand [-- --apply] [--jobs 4] [--limit 100] [--cat "X"]
 *
 * Reruns are safe: proposals dedupe against the catalog (including previously
 * generated entries), so only genuinely new assemblies are added.
 *
 * Stage A proposes spec shells per category (deduped against the catalog);
 * stage B generates exact geometry for each (same validators as upgrade.ts).
 * With --apply, entries land in src/data/generated-assemblies.json (wrapped by
 * generated-assemblies.ts, spread into the catalog) and their slugs are added
 * to the matching browse tab in Sections.tsx. Then run textbook:build + check.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { CONSTRUCTION_CATALOG } from "@/data/construction-catalog";
import type { ConstructionEntry } from "@/data/construction-catalog";
import { toSpec } from "@/lib/catalog";
import { buildPlan } from "@/lib/plan";
import type { CustomStep } from "@/lib/types";
import { classifyTextbook } from "./classify";
import { SYSTEM, chat, extractJson, parityGap, structural } from "./upgrade";

const DIR = import.meta.dirname;
const DATA = path.join(DIR, "../../src/data/generated-assemblies.json");
const WRAPPER = path.join(DIR, "../../src/data/generated-assemblies.ts");
const SECTIONS = path.join(DIR, "../../src/components/home/Sections.tsx");

const TABS = ["building", "foundations", "floors", "walls", "roofs", "moisture-thermal", "doors-windows", "special", "finish", "mechanical", "electrical"];
const CATS = ["Framing & Carpentry", "Structural & Framing", "Civil & Heavy", "Finishing", "Mechanical & Systems", "Furniture & Interior", "Specialty"];

/** New assemblies per category (thin categories first). */
const DEFAULT_PLAN: [string, number][] = [
  ["Structural & Framing", 20],
  ["Specialty", 15],
  ["Mechanical & Systems", 15],
  ["Finishing", 15],
  ["Framing & Carpentry", 15],
  ["Civil & Heavy", 10],
  ["Furniture & Interior", 10],
];

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const JOBS = Math.max(1, Number(args.includes("--jobs") ? args[args.indexOf("--jobs") + 1] : 4) || 4);
const LIMIT = Math.max(1, Number(args.includes("--limit") ? args[args.indexOf("--limit") + 1] : 100) || 100);
const ONLY_CAT = args.includes("--cat") ? (args[args.indexOf("--cat") + 1] ?? "") : "";

interface Spec {
  slug: string;
  name: string;
  variant: string;
  category: string;
  material: string;
  size: { w: number; h: number; d: number };
  minutes: number;
  people: number;
  tips: { frame?: string; general: string[] };
  watchOut: string[];
  keywords: string[];
  tab: string;
}

const SPEC_SYSTEM = `You are a trade-school curriculum designer. Propose apprentice-training build assemblies as JSON.
Each assembly is one buildable detail: a real structure, joint, system or installation an apprentice constructs hands-on (never a whole house, never a procedure without parts, never a duplicate or size variant of an existing one).
Reply with ONLY a JSON array of objects with exactly these fields:
slug (kebab-case, 2-6 words, globally unique), name (trade-flavoured title under 70 chars), variant (one line: key members, sizes, spacing), category (exactly as given), material (comma list under 140 chars), size {w,h,d} (realistic envelope in cm: the finished assembly must fit inside), minutes (15-480), people (1 or 2), tips {frame?: one layout sentence, general: 1-3 trade bullets}, watchOut (1-3 safety/code bullets), keywords (3-6 search words), tab (exactly one of: ${TABS.join(", ")}) matching where apprentices would browse for it.`;

/* ---------------- stage A: propose ---------------- */

function specIssues(s: Spec, takenSlugs: Set<string>, takenPairs: Set<string>): string[] {
  const bad: string[] = [];
  if (!s || typeof s !== "object") return ["not an object"];
  if (!/^[a-z0-9]+(-[a-z0-9]+){1,5}$/.test(s.slug ?? "")) bad.push("bad slug");
  else if (takenSlugs.has(s.slug)) bad.push(`duplicate slug ${s.slug}`);
  if (!s.name || s.name.length > 70) bad.push("bad name");
  if (!s.variant || s.variant.length > 200) bad.push("bad variant");
  if (takenPairs.has(`${s.name}|${s.variant}`)) bad.push("duplicate name+variant");
  if (!CATS.includes(s.category)) bad.push(`bad category ${s.category}`);
  if (!s.material || s.material.length > 160) bad.push("bad material");
  for (const k of ["w", "h", "d"] as const) {
    const v = s.size?.[k];
    if (!(typeof v === "number" && v >= 5 && v <= 1500)) bad.push(`bad size ${k}`);
  }
  if (!(s.minutes >= 15 && s.minutes <= 480)) bad.push("bad minutes");
  if (s.people !== 1 && s.people !== 2) bad.push("bad people");
  if (!s.tips || !Array.isArray(s.tips.general) || !s.tips.general.length || s.tips.general.length > 3) bad.push("bad tips");
  if (!Array.isArray(s.watchOut) || !s.watchOut.length || s.watchOut.length > 3) bad.push("bad watchOut");
  if (!Array.isArray(s.keywords) || s.keywords.length < 2 || s.keywords.length > 8) bad.push("bad keywords");
  if (!TABS.includes(s.tab)) bad.push(`bad tab ${s.tab}`);
  return bad;
}

function extractArray(text: string): unknown {
  const t = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fence ? fence[1] : t;
  const start = body.indexOf("[");
  const end = body.lastIndexOf("]");
  if (start < 0 || end < start) return null;
  try {
    return JSON.parse(body.slice(start, end + 1));
  } catch {
    return null;
  }
}

async function propose(category: string, n: number, takenSlugs: Set<string>, takenPairs: Set<string>, takenNames: string[]): Promise<Spec[]> {
  const out: Spec[] = [];
  let feedback = "";
  for (let round = 1; round <= 3 && out.length < n; round++) {
    const need = n - out.length;
    const user =
      `Category: ${category}. Propose ${need} assemblies.` +
      `\nExisting assemblies (do not repeat or closely overlap these):\n${takenNames.join("\n")}` +
      (out.length ? `\nAlready accepted this round (do not repeat):\n${out.map((s) => `- ${s.name} (${s.variant})`).join("\n")}` : "") +
      feedback;
    let text = "";
    try {
      text = (await chat(SPEC_SYSTEM, user, 12000, 0.6)).text;
    } catch (e) {
      console.log(`  propose ${category}: api error ${(e as Error).message}`);
      return out;
    }
    const arr = extractArray(text) as Spec[] | null;
    if (!Array.isArray(arr)) {
      feedback = "\n\nYour last reply was not a JSON array. Reply with ONLY the array.";
      continue;
    }
    let kept = 0;
    for (const s of arr) {
      const issues = specIssues(s, takenSlugs, takenPairs);
      if (issues.length) continue;
      takenSlugs.add(s.slug);
      takenPairs.add(`${s.name}|${s.variant}`);
      out.push(s);
      kept++;
      if (out.length >= n) break;
    }
    feedback = kept ? "" : "\n\nNone of your last proposals validated (duplicates or bad fields). Propose DIFFERENT assemblies with valid fields.";
  }
  return out;
}

/* ---------------- stage B: geometry ---------------- */

function geoUser(spec: Spec): string {
  return [
    `Assembly: ${spec.name}`,
    `Variant: ${spec.variant}`,
    `Material: ${spec.material}`,
    `Envelope: about ${spec.size.w} x ${spec.size.h} x ${spec.size.d} cm (w,h,d).`,
    `Design the parts and steps from scratch for this assembly. There is no existing geometry to patch.`,
  ].join("\n");
}

function shellOf(spec: Spec, custom: { parts: never[]; steps: never[] }): ConstructionEntry {
  return {
    slug: spec.slug,
    family: spec.slug.split("-").slice(0, 2).join("-"),
    name: spec.name,
    variant: spec.variant,
    category: spec.category,
    archetype: "custom",
    brand: "Apprentice Training",
    material: spec.material,
    size: spec.size,
    minutes: spec.minutes,
    people: spec.people as 1 | 2,
    tips: spec.tips,
    watchOut: spec.watchOut,
    keywords: spec.keywords,
    featured: false,
    checked: false,
    difficulty: (spec as { difficulty?: 1 | 2 | 3 }).difficulty ?? 2,
    custom: custom as never,
  } as unknown as ConstructionEntry;
}

async function generate(spec: Spec): Promise<{ ok: boolean; detail: string; entry?: ConstructionEntry }> {
  let feedback = "";
  let maxTokens = 12000;
  for (let attempt = 1; attempt <= 3; attempt++) {
    let text = "";
    let apiErr = "";
    let cut = false;
    for (let t = 1; t <= 3 && !text; t++) {
      try {
        const r = await chat(SYSTEM, geoUser(spec) + feedback, maxTokens);
        text = r.text;
        cut = r.truncated;
      } catch (e) {
        apiErr = (e as Error).message;
        await new Promise((r) => setTimeout(r, 5000 * t));
      }
    }
    if (!text) return { ok: false, detail: `api error: ${apiErr}` };
    if (cut) {
      maxTokens = 24000;
      feedback = "\n\nYour last reply was cut off mid-JSON. Reply again with ONLY the complete JSON object.";
      continue;
    }
    const draft = extractJson(text) as { parts?: never[]; steps?: CustomStep[] } | null;
    if (!draft || !Array.isArray(draft.parts) || !Array.isArray(draft.steps)) {
      writeFileSync(`/tmp/expand-${spec.slug}.attempt${attempt}.raw.txt`, text);
      feedback = "\n\nYour last reply was not a JSON object with parts and steps arrays. Reply with ONLY that JSON.";
      continue;
    }
    const issues = structural(draft.parts as never[], draft.steps, spec.size);
    if (issues.length) {
      feedback = `\n\nYour last draft failed validation:\n- ${issues.slice(0, 12).join("\n- ")}\nFix every issue and reply with ONLY the corrected JSON.`;
      continue;
    }
    const res = classifyTextbook(shellOf(spec, draft as { parts: never[]; steps: never[] }));
    if ("reject" in res) {
      feedback = `\n\nYour last draft was rejected: ${res.reject}. Fix it and reply with ONLY the corrected JSON.`;
      continue;
    }
    try {
      const plan = buildPlan(toSpec(res.ok));
      if (!plan.steps.length || !plan.parts.length) throw new Error("empty plan");
      const gap = parityGap(plan, draft.steps);
      if (gap) {
        feedback = `\n\n${gap}: every fastener must sit on a real joint (members touching or nested), counts per fix at most 48 (at most 12 brackets). Reply with ONLY the corrected JSON.`;
        continue;
      }
      return { ok: true, detail: `${plan.parts.length} types, ${plan.steps.length} steps`, entry: shellOf(spec, draft as { parts: never[]; steps: never[] }) };
    } catch (e) {
      feedback = `\n\nYour last draft does not build: ${(e as Error).message}. Fix the geometry and reply with ONLY the corrected JSON.`;
    }
  }
  const last = feedback.replace(/\n+/g, " ").slice(0, 220);
  return { ok: false, detail: `draft rejected 3 times (${last || "no detail"})` };
}

/* ---------------- main ---------------- */

const WRAPPER_SRC = `import type { ConstructionEntry } from "./construction-catalog";
import DATA from "./generated-assemblies.json" with { type: "json" };

/** AI-generated textbook assemblies (scripts/textbook/expand.ts). Do not hand-edit; regenerate instead. */
export const GENERATED_ASSEMBLIES: ConstructionEntry[] = (DATA as { entries: ConstructionEntry[] }).entries;
`;

function insertTabs(byTab: Map<string, string[]>) {
  let src = readFileSync(SECTIONS, "utf8");
  for (const [tab, slugs] of byTab) {
    for (const slug of slugs) {
      if (src.includes(`"${slug}"`)) continue;
      const re = new RegExp(`((?:"${tab}"|${tab}): \\[[\\s\\S]*?)(\\n  \\],)`);
      if (!re.test(src)) {
        console.log(`  no tab block for ${tab}, skipping ${slug}`);
        continue;
      }
      src = src.replace(re, `$1\n    "${slug}",$2`);
    }
  }
  writeFileSync(SECTIONS, src);
}

async function main() {
  const plan = DEFAULT_PLAN.filter(([c]) => !ONLY_CAT || c === ONLY_CAT);
  if (ONLY_CAT && !plan.length) {
    console.error(`unknown category ${ONLY_CAT}; one of: ${CATS.join(", ")}`);
    process.exit(1);
  }
  const takenSlugs = new Set(CONSTRUCTION_CATALOG.map((e) => e.slug));
  const takenPairs = new Set(CONSTRUCTION_CATALOG.map((e) => `${e.name}|${e.variant}`));
  const takenNames = CONSTRUCTION_CATALOG.map((e) => `- ${e.name} (${e.variant}) [${e.category}]`);

  // stage A
  console.log("stage A: proposing specs");
  const specs: Spec[] = [];
  for (const [cat, n] of plan) {
    if (specs.length >= LIMIT) break;
    const got = await propose(cat, Math.min(n, LIMIT - specs.length), takenSlugs, takenPairs, takenNames);
    console.log(`  ${cat}: ${got.length} specs`);
    specs.push(...got);
  }
  if (!specs.length) {
    console.error("no specs proposed");
    process.exit(1);
  }

  // stage B
  console.log(`stage B: generating geometry for ${specs.length} assemblies (${JOBS} workers)${APPLY ? " (writing)" : " (dry run)"}`);
  const store = (existsSync(DATA) ? JSON.parse(readFileSync(DATA, "utf8")) : { entries: [], tabs: {} }) as { _readme?: string; entries: ConstructionEntry[]; tabs: Record<string, string> };
  store.tabs = store.tabs ?? {};
  const bySlug = new Map(store.entries.map((e) => [e.slug, e]));
  const persist = () => {
    try {
      const disk = JSON.parse(readFileSync(DATA, "utf8")) as { entries: ConstructionEntry[]; tabs: Record<string, string> };
      for (const e of disk.entries) if (!bySlug.has(e.slug)) bySlug.set(e.slug, e);
      Object.assign(store.tabs, disk.tabs ?? {});
    } catch {
      /* missing file: memory wins */
    }
    store.entries = [...bySlug.values()].sort((a, b) => (a.slug < b.slug ? -1 : 1));
    store._readme = "AI-generated textbook assemblies (scripts/textbook/expand.ts). Each entry is a full ConstructionEntry; tabs maps slugs to Sections.tsx CHING_TOPICS lists.";
    writeFileSync(DATA, JSON.stringify({ _readme: store._readme, tabs: store.tabs, entries: store.entries }, null, 2) + "\n");
  };
  const queue = [...specs];
  let made = 0;
  const failed: string[] = [];
  await Promise.all(
    Array.from({ length: Math.min(JOBS, queue.length) }, async () => {
      while (queue.length) {
        const spec = queue.shift()!;
        let r: { ok: boolean; detail: string; entry?: ConstructionEntry };
        try {
          r = await generate(spec);
        } catch (e) {
          r = { ok: false, detail: `crashed: ${(e as Error).message}` };
        }
        console.log(`${r.ok ? "PASS" : "FAIL"} ${spec.slug}: ${r.detail}`);
        if (r.ok && r.entry) {
          made++;
          if (APPLY) {
            bySlug.set(r.entry.slug, r.entry);
            store.tabs[r.entry.slug] = spec.tab;
            persist();
          }
        } else failed.push(spec.slug);
      }
    }),
  );

  if (APPLY && made) {
    if (!existsSync(WRAPPER)) writeFileSync(WRAPPER, WRAPPER_SRC);
    // reconcile: insert every stored slug into its tab (repairs older runs too)
    const byTab = new Map<string, string[]>();
    for (const [slug, tab] of Object.entries(store.tabs)) {
      if (!byTab.has(tab)) byTab.set(tab, []);
      byTab.get(tab)!.push(slug);
    }
    insertTabs(byTab);
    console.log(`wrote ${made} new assemblies to src/data/generated-assemblies.json`);
  }
  if (failed.length) console.log(`\n${failed.length} failed: ${failed.join(", ")}`);
  console.log(failed.length ? "done with failures" : "all good");
  if (failed.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
