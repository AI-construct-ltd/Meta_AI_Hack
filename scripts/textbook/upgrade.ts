/**
 * Regenerates accurate trade geometry with Gemini, offline.
 *
 *   npm run textbook:upgrade [-- --only a,b] [--apply] [--all] [--resume] [--jobs 4]
 *
 * Without --apply it validates each draft and leaves the JSON under /tmp for
 * review; with --apply each passing draft is written straight into
 * src/data/textbook-upgrades.json, which construction-catalog.ts overlays onto
 * the hand-authored blocks. Default scope is the pilot list below; --all covers
 * every trade assembly. --resume skips slugs already in the upgrades file, so a
 * failed run can be continued. --jobs sets parallel API workers (default 4).
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { CONSTRUCTION_CATALOG } from "@/data/construction-catalog";
import { toSpec } from "@/lib/catalog";
import { buildPlan } from "@/lib/plan";
import type { CustomPart, CustomPiece, CustomStep, Plan } from "@/lib/types";
import { classifyTextbook } from "./classify";

const DIR = import.meta.dirname;
const DATA = path.join(DIR, "../../src/data/textbook-upgrades.json");

const PILOT = ["steel-roof-deck-assembly", "heavy-timber-kingpost-truss", "cmu-block-foundation-wall"];

const args = process.argv.slice(2);
const onlyArg = args.includes("--only") ? (args[args.indexOf("--only") + 1] ?? "") : "";
const APPLY = args.includes("--apply");
const RESUME = args.includes("--resume");
const JOBS = Math.max(1, Number(args.includes("--jobs") ? args[args.indexOf("--jobs") + 1] : 4) || 4);
const slugs = onlyArg ? onlyArg.split(",").map((s) => s.trim()).filter(Boolean) : args.includes("--all") ? CONSTRUCTION_CATALOG.map((e) => e.slug) : PILOT;

/* ---------------- minimal Gemini client (node only, no app imports) ---------------- */

function loadEnv(): Record<string, string> {
  const out: Record<string, string> = { ...process.env } as Record<string, string>;
  for (const f of [".env", ".env.local"]) {
    try {
      for (const line of readFileSync(path.join(DIR, "../..", f), "utf8").split("\n")) {
        const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
        if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    } catch {
      /* missing file */
    }
  }
  return out;
}

const ENV = loadEnv();
const BASE = (ENV.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai").replace(/\/+$/, "");
const MODELS = (ENV.TEXTBOOK_MODEL || "gemini-3.8-flash,gemini-2.5-flash").split(",").map((m) => m.trim()).filter(Boolean);
const KEY = ENV.GEMINI_API_KEY || "";

export function extractJson(text: string): unknown {
  const t = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fence ? fence[1] : t;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end < start) return null;
  try {
    return JSON.parse(body.slice(start, end + 1));
  } catch {
    return null;
  }
}

export async function chat(system: string, user: string, maxTokens: number, temperature = 0.2): Promise<{ text: string; truncated: boolean }> {
  let last = "";
  for (const model of MODELS) {
    const res = await fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        max_tokens: maxTokens,
        temperature,
        response_format: { type: "json_object" },
      }),
    });
    if (res.ok) {
      const j = (await res.json()) as { choices?: { message?: { content?: string }; finish_reason?: string }[] };
      const text = j?.choices?.[0]?.message?.content ?? "";
      if (text.trim()) return { text, truncated: j?.choices?.[0]?.finish_reason === "length" };
      last = "empty text";
      continue;
    }
    last = `gemini ${res.status}: ${(await res.text()).slice(0, 200)}`;
    if (res.status !== 404 && res.status !== 400) throw new Error(last);
  }
  throw new Error(last || "no model available");
}

/* ---------------- prompt ---------------- */

export const SYSTEM = `You are a construction detailer redrawing apprentice-training assemblies as exact 3D geometry.
Units are millimetres. Y is up from the floor, X runs left to right, Z runs back to front.
Each part's pos is the centre of its bounding box; size is its bounding box in mm.

Geometry vocabulary (prefer real shapes over plain boxes):
- { shape: "box", size: [x,y,z] } — lumber, plates, blocks, panels.
- { shape: "cyl", size: [dia, length, dia] } — pipes, bolts, rebar running straight. Only for members along one axis; give rot in degrees to orient them (size is then local: [dia, length, dia]).
- { shape: "prism", size: [legX, legY, length] } — a right triangular prism: legs along X and Y, extruded along Z. Use for cant strips, welds, haunches. Orient with rot.
- rot: [rx, ry, rz] in DEGREES about the part centre (XYZ euler). Rafters at pitch, diagonal bracing, sloped members.
- pieces: [ { shape, size, pos, rot?, material?, profile? } ] — multi-solid parts, coordinates relative to the part centre. Use for: open-web joists (chords + web diagonals), CMU blocks (two face shells + webs around hollow cores), built-up sections. Keep under 24 pieces per part.
- profile: { kind: "fluted", ribs, pitch, depth, top?, bottom?, length, thick? } — on a part OR a piece: corrugated deck/siding with ribs running along X (length in X, ribs*pitch across Z, depth in Y), expanded to exact thin boxes. Real Type B roof deck: 38 mm deep ribs at 152 mm pitch. Part size must equal [length, depth, ribs*pitch].
- profile: { kind: "ibeam", depth, flange, web, thick, length } — on a part OR a piece: a structural I section along X. Part size must equal [length, depth, flange].

Rules:
- Use real product dimensions from the name, variant and material (actual 2x4 = 38x89 mm, 8x8x16 CMU = 203x203x406 mm with two cores, Type B deck ribs 38 deep at 152 pitch, 16d nails, #12 tek screws).
- Parts that join must TOUCH: faces within 4 mm. Stacked boxes: centres differ by half the sum of heights. Resting members: bottom face at the support's top face.
- pos Y must sit on or above the floor (bounding box min Y >= 0); the assembly stands on y=0.
- Centre the assembly on x=0 and z=0: every part centre must stay within half the envelope WxD above (plus 30 mm). Never lay the assembly out in one quadrant.
- Every part id appears in exactly one step's add list. Steps: 2 to 8, each with a short imperative title and one or two sentences of trade-correct detail.
- fix kinds: nail (16d framing), screw (#12 tek / wood screws), bolt (through-bolts with nuts), bracket (anchors), hinge, knob, handle, pin, plate, glide, plug, castor. Counts: realistic (two nails per stud end, screws in every deck rib valley).
- tools from: allen, screwdriver, flathead, hammer, drill, level, tape, pencil, wrench, knife.
- pose from: +y, -y, +z, -z, +x, -x (how the assembly tips toward the camera; +y default).
- warnings from: two, loose, hand, wall, square, floor, face, tip. people: 1 or 2.
- materials: board (concrete/masonry/drywall/panels), fiber (membranes/insulation/felt), wood (lumber/timber), metal (steel/fasteners), soft (cushions/fabrics).
- Model assemblies from their real members: frame walls as separate plates plus studs, never as one monolithic box; pipes, tubes, conduits, ducts and rebar as cyl, never as square boxes.
- Shape of the answer (field names exactly like this):
{
  "parts": [
    { "id": "PLATE", "name": "Sole plate", "size": [1200, 38, 89], "pos": [0, 19, 0], "material": "wood" },
    { "id": "STUD1", "name": "Stud", "size": [38, 2324, 89], "pos": [-400, 1200, 0], "material": "wood" }
  ],
  "steps": [
    { "title": "Lay the sole plate", "detail": "One sentence of trade instruction.", "add": ["PLATE"], "tools": ["tape"], "pose": "+y" },
    { "title": "Stand and nail the stud", "detail": "One sentence of trade instruction.", "add": ["STUD1"], "fix": [{ "kind": "nail", "count": 2 }], "tools": ["hammer", "level"], "pose": "+y" }
  ]
}
- Round all coordinates to whole mm. No commentary, no markdown: respond with ONLY that JSON object.`;

function userMessage(e: (typeof CONSTRUCTION_CATALOG)[number]): string {
  return [
    `Assembly: ${e.name}`,
    `Variant: ${e.variant}`,
    `Material: ${e.material ?? "as named"}`,
    `Envelope: about ${e.size.w} x ${e.size.h} x ${e.size.d} cm (w,h,d).`,
    `Current blocks (redesign for accuracy, do not patch):`,
    JSON.stringify(e.custom),
  ].join("\n");
}

/* ---------------- validation ---------------- */

const MATERIALS = new Set(["board", "fiber", "wood", "metal", "soft"]);
const SHAPES = new Set(["box", "cyl", "prism"]);
const FIXES = new Set(["dowel", "camScrew", "cam", "screw", "nail", "pin", "legScrew", "bolt", "plate", "bracket", "runner", "knob", "handle", "hinge", "glide", "plug", "castor", "gasLift", "connector", "roller", "flatHinge", "hook"]);
const TOOLS = new Set(["allen", "screwdriver", "flathead", "hammer", "drill", "level", "tape", "pencil", "wrench", "knife"]);
const POSES = new Set(["+y", "-y", "+z", "-z", "+x", "-x"]);
const WARNS = new Set(["two", "loose", "hand", "wall", "square", "floor", "face", "tip"]);

const isVec = (v: unknown): v is [number, number, number] => Array.isArray(v) && v.length === 3 && v.every((n) => typeof n === "number" && Number.isFinite(n));

function checkPiece(q: CustomPiece, where: string, issues: string[]) {
  if (!isVec(q.size) || q.size.some((n) => n <= 0 || n > 10000)) issues.push(`${where}: bad size`);
  if (!isVec(q.pos)) issues.push(`${where}: bad pos`);
  if (q.shape && !SHAPES.has(q.shape)) issues.push(`${where}: bad shape ${q.shape}`);
  if (q.rot && !isVec(q.rot)) issues.push(`${where}: bad rot`);
  if (q.material && !MATERIALS.has(q.material)) issues.push(`${where}: bad material ${q.material}`);
  const pr = q.profile;
  if (pr) {
    if (pr.kind === "fluted") {
      if (!(pr.ribs >= 1 && pr.ribs <= 40 && pr.pitch > 0 && pr.depth > 0 && pr.length > 0)) issues.push(`${where}: bad fluted dims`);
      const top = pr.top ?? pr.pitch * 0.4, bottom = pr.bottom ?? pr.pitch * 0.4;
      if (top + bottom >= pr.pitch) issues.push(`${where}: fluted top+bottom must be under the pitch`);
    } else if (pr.kind === "ibeam") {
      if (!(pr.depth > 0 && pr.flange > 0 && pr.web > 0 && pr.thick > 0 && pr.length > 0 && 2 * pr.thick < pr.depth)) issues.push(`${where}: bad ibeam dims`);
    } else issues.push(`${where}: bad profile kind`);
  }
}

export function structural(parts: CustomPart[], steps: CustomStep[], size?: { w: number; h: number; d: number }): string[] {
  const issues: string[] = [];
  // never throw on a malformed draft: report issues so the model gets corrective feedback
  if (!Array.isArray(parts) || !parts.length || parts.length > 60) return ["parts must be 1..60 items"];
  if (!Array.isArray(steps) || steps.length < 1 || steps.length > 10) return ["steps must be 1..10 items"];
  if (size) {
    for (const p of parts) {
      const X = Math.abs(p?.pos?.[0] ?? 0), Z = Math.abs(p?.pos?.[2] ?? 0);
      if (X * 2 > size.w * 10 + 60 || Z * 2 > size.d * 10 + 60) {
        issues.push(`part ${p?.id ?? "?"} sits outside the ${size.w}x${size.d} cm footprint: centre the assembly on x=0, z=0`);
      }
    }
  }
  const list = <T>(v: unknown): T[] => (Array.isArray(v) ? v : []);
  const ids = new Set<string>();
  for (const p of parts ?? []) {
    if (!p || typeof p.id !== "string" || !/^[A-Za-z0-9_]+$/.test(p.id)) issues.push("part with bad id");
    else if (ids.has(p.id)) issues.push(`duplicate part id ${p.id}`);
    else ids.add(p.id);
    if (typeof p?.name !== "string" || !p.name) issues.push(`${p?.id ?? "?"}: missing name`);
    checkPiece({ shape: p?.shape, size: p?.size, pos: p?.pos, rot: p?.rot, material: p?.material } as CustomPiece, `part ${p?.id ?? "?"}`, issues);
    if (p?.profile) checkPiece({ size: p.size, pos: p.pos, profile: p.profile } as CustomPiece, `part ${p.id} profile`, issues);
    if (p?.pieces !== undefined && !Array.isArray(p.pieces)) issues.push(`part ${p.id}: pieces must be an array`);
    else if (p?.pieces && p.pieces.length > 40) issues.push(`part ${p.id}: too many pieces`);
    for (const q of list<CustomPiece>(p?.pieces)) checkPiece(q ?? ({} as CustomPiece), `part ${p.id} piece`, issues);
  }
  const added = new Set<string>();
  for (const s of steps ?? []) {
    if (typeof s?.title !== "string" || !s.title) issues.push("step with no title");
    if (s?.add !== undefined && !Array.isArray(s.add)) issues.push(`step "${s?.title}": add must be an array`);
    for (const id of list<string>(s?.add)) {
      if (!ids.has(id)) issues.push(`step "${s.title}" adds unknown part ${id}`);
      else if (added.has(id)) issues.push(`part ${id} added twice`);
      else added.add(id);
    }
    if (s?.fix !== undefined && !Array.isArray(s.fix)) issues.push(`step "${s?.title}": fix must be an array like [{"kind":"screw","count":8}], got ${JSON.stringify(s.fix).slice(0, 80)}`);
    for (const f of list<{ kind?: string; count?: number }>(s?.fix)) {
      if (!FIXES.has(f?.kind as never)) issues.push(`step "${s.title}": bad fix kind ${JSON.stringify(f?.kind)} (want one of: ${["nail", "screw", "bolt", "bracket", "hinge", "pin", "plate"].join(", ")}, ...)`);
      if (!(f && Number.isInteger(f.count) && (f.count as number) >= 1 && (f.count as number) <= 48)) issues.push(`step "${s.title}": bad fix count ${JSON.stringify(f?.count)} (want an integer 1..48)`);
    }
    if (s?.tools !== undefined && !Array.isArray(s.tools)) issues.push(`step "${s?.title}": tools must be an array`);
    for (const t of list<string>(s?.tools)) if (!TOOLS.has(t)) issues.push(`step "${s.title}": bad tool ${t}`);
    if (s?.pose && !POSES.has(s.pose)) issues.push(`step "${s.title}": bad pose ${s.pose}`);
    if (s?.warnings !== undefined && !Array.isArray(s.warnings)) issues.push(`step "${s?.title}": warnings must be an array`);
    for (const w of list<string>(s?.warnings)) if (!WARNS.has(w)) issues.push(`step "${s.title}": bad warning ${w}`);
    if (s?.people !== undefined && s.people !== 1 && s.people !== 2) issues.push(`step "${s.title}": bad people`);
  }
  for (const id of ids) if (!added.has(id)) issues.push(`part ${id} is never added`);
  return issues;
}

/* ---------------- main ---------------- */

/** Every requested fastener must appear in 3D (mirrored in check.ts). Null when parity holds. */
export function parityGap(plan: Plan, steps: CustomStep[]): string | null {
  let req = 0;
  for (const s of steps) for (const f of s.fix ?? []) req += f.count;
  const got = plan.items.filter((i) => i.kind === "hw").length;
  return got === req ? null : `${req} fasteners requested but ${got} placed`;
}

/** Pilots must keep using the accurate-geometry vocabulary (mirrored in check.ts). */
const PILOT_NEEDS: Record<string, { profiles?: boolean; rotated?: boolean; pieces?: boolean }> = {
  "steel-roof-deck-assembly": { profiles: true, pieces: true },
  "heavy-timber-kingpost-truss": { rotated: true },
  "cmu-block-foundation-wall": { pieces: true },
};

async function upgrade(slug: string): Promise<{ slug: string; ok: boolean; detail: string; draft?: { parts: CustomPart[]; steps: CustomStep[] } }> {
  const entry = CONSTRUCTION_CATALOG.find((e) => e.slug === slug);
  if (!entry) return { slug, ok: false, detail: "unknown slug" };
  let feedback = "";
  let maxTokens = 12000;
  for (let attempt = 1; attempt <= 3; attempt++) {
    let text = "";
    let apiErr = "";
    let cut = false;
    for (let t = 1; t <= 3 && !text; t++) {
      try {
        const r = await chat(SYSTEM, userMessage(entry) + feedback, maxTokens);
        text = r.text;
        cut = r.truncated;
      } catch (e) {
        apiErr = (e as Error).message;
        await new Promise((r) => setTimeout(r, 5000 * t));
      }
    }
    if (!text) return { slug, ok: false, detail: `api error: ${apiErr}` };
    if (cut) {
      maxTokens = 24000;
      feedback = "\n\nYour last reply was cut off mid-JSON. Reply again with ONLY the complete JSON object, keeping parts under 60 and pieces tight.";
      continue;
    }
    const raw = extractJson(text);
    const draft = raw as { parts?: CustomPart[]; steps?: CustomStep[] } | null;
    if (!draft || !Array.isArray(draft.parts) || !Array.isArray(draft.steps)) {
      writeFileSync(`/tmp/upgrade-${slug}.attempt${attempt}.raw.txt`, text);
      feedback = `\n\nYour last reply was not a JSON object with parts and steps arrays (raw reply saved for inspection). Reply with ONLY that JSON.`;
      continue;
    }
    const issues = structural(draft.parts, draft.steps, entry.size);
    if (issues.length) {
      feedback = `\n\nYour last draft failed validation:\n- ${issues.slice(0, 12).join("\n- ")}\nFix every issue and reply with ONLY the corrected JSON.`;
      continue;
    }
    const res = classifyTextbook({ ...entry, custom: { parts: draft.parts, steps: draft.steps } });
    if ("reject" in res) {
      feedback = `\n\nYour last draft was rejected: ${res.reject}. Fix it and reply with ONLY the corrected JSON.`;
      continue;
    }
    try {
      const plan = buildPlan(toSpec(res.ok));
      if (!plan.steps.length || !plan.parts.length) throw new Error("empty plan");
      const gap = parityGap(plan, draft.steps);
      if (gap) {
        feedback = `\n\n${gap}: every fastener must sit on a real joint (members touching or nested), counts per fix at most 48 (at most 12 brackets); drop anchors to unmodeled structure. Reply with ONLY the corrected JSON.`;
        continue;
      }
      const rot = draft.parts.filter((p) => p.rot).length;
      const pieces = draft.parts.reduce((s, p) => s + (p.pieces?.length ?? 0), 0) + draft.parts.filter((p) => p.shape === "prism").length;
      const profiles = draft.parts.flatMap((p) => p.pieces ?? []).filter((q) => q.profile).length + draft.parts.filter((p) => p.profile).length;
      const need = PILOT_NEEDS[slug];
      const missingVocab: string[] = [];
      if (need?.profiles && !profiles) missingVocab.push("a fluted or ibeam profile (the deck/beams must not be plain boxes)");
      if (need?.rotated && !rot) missingVocab.push("rot in degrees on the sloped members (rafters at pitch, not horizontal boxes)");
      if (need?.pieces && !pieces) missingVocab.push("pieces or a prism shape (hollow/built-up members, not solid blocks)");
      if (missingVocab.length) {
        feedback = `\n\nYour last draft is plain boxes where the real part is not: use ${missingVocab.join("; ")}. Reply with ONLY the corrected JSON.`;
        continue;
      }
      return { slug, ok: true, detail: `${plan.parts.length} types, ${plan.steps.length} steps, ${rot} rotated, ${pieces} pieces/prisms, ${profiles} profiles`, draft: { parts: draft.parts, steps: draft.steps } };
    } catch (e) {
      feedback = `\n\nYour last draft does not build: ${(e as Error).message}. Fix the geometry and reply with ONLY the corrected JSON.`;
    }
  }
  const last = feedback.replace(/\n+/g, " ").slice(0, 220);
  return { slug, ok: false, detail: `draft rejected 3 times (${last || "see /tmp/upgrade-<slug>.attempt*.raw.txt"})` };
}

async function main() {
  if (!KEY) {
    console.error("missing GEMINI_API_KEY (put it in .env)");
    process.exit(1);
  }
  const missing = slugs.filter((s) => !CONSTRUCTION_CATALOG.some((e) => e.slug === s));
  if (missing.length) {
    console.error(`unknown slugs: ${missing.join(", ")}`);
    process.exit(1);
  }
  const store = JSON.parse(readFileSync(DATA, "utf8")) as Record<string, unknown>;
  const queue = RESUME ? slugs.filter((s) => !(s in store)) : [...slugs];
  console.log(`upgrading ${queue.length} assemblies (${JOBS} workers) with ${MODELS.join("/")} ${APPLY ? "(writing)" : "(dry run, see /tmp/upgrade-<slug>.json)"}`);
  const persist = () => {
    // merge-on-write: a concurrent run's progress on disk is preserved, never clobbered
    let disk: Record<string, unknown> = {};
    try {
      disk = JSON.parse(readFileSync(DATA, "utf8")) as Record<string, unknown>;
    } catch {
      /* missing or mid-write file: fall back to memory */
    }
    for (const [k, v] of Object.entries(store)) disk[k] = v;
    for (const [k, v] of Object.entries(disk)) if (k !== "_readme") store[k] = v;
    const ordered: Record<string, unknown> = { _readme: disk._readme ?? store._readme };
    for (const k of Object.keys(store).filter((k) => k !== "_readme").sort()) ordered[k] = store[k];
    writeFileSync(DATA, JSON.stringify(ordered, null, 2) + "\n");
  };
  let ok = 0;
  const failed: string[] = [];
  await Promise.all(
    Array.from({ length: Math.min(JOBS, queue.length) }, async () => {
      while (queue.length) {
        const slug = queue.shift()!;
        let r: { ok: boolean; detail: string; draft?: { parts: CustomPart[]; steps: CustomStep[] } };
        try {
          r = await upgrade(slug);
        } catch (e) {
          r = { ok: false, detail: `crashed: ${(e as Error).message}` };
        }
        console.log(`${r.ok ? "PASS" : "FAIL"} ${slug}: ${r.detail}`);
        if (r.ok && r.draft) {
          ok++;
          writeFileSync(`/tmp/upgrade-${slug}.json`, JSON.stringify(r.draft, null, 2));
          if (APPLY) {
            store[slug] = r.draft;
            persist();
          }
        } else failed.push(slug);
      }
    }),
  );
  if (APPLY && ok) console.log(`wrote ${ok} upgrades to src/data/textbook-upgrades.json`);
  if (failed.length) {
    console.log(`\n${failed.length} failed: ${failed.join(", ")}`);
    console.log("rerun with --resume to retry only those");
    process.exit(1);
  }
  console.log("all good");
}

const isMain = process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;
if (isMain) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}