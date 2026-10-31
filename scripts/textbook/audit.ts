/**
 * Accuracy + reachability audit over every trade assembly.
 *
 *   npm run textbook:audit
 *
 * Checks each assembly for floating parts (no contact within 6 mm),
 * hardware coverage, geometry-vocabulary expectations (rotated members,
 * fluted/ibeam profiles, prisms, cored pieces, cyl members), search
 * reachability (first 3 slug words must hit in the top 8), upgrade
 * coverage, and textbook-tab membership. Exits non-zero on any flag
 * that is not in the ACCEPTED allowlist below.
 */
import { readFileSync } from "node:fs";
import { CONSTRUCTION_CATALOG } from "@/data/construction-catalog";
import { TRADES_MODULES } from "@/data/trades-modules";
import { BOOK_ASSEMBLIES } from "@/data/book-assemblies";
import { CHING_ASSEMBLIES } from "@/data/ching-assemblies";
import { catalogSpec } from "@/lib/catalog";
import { buildPlan } from "@/lib/plan";
import { rotate } from "@/lib/plan/math";
import { searchCatalog } from "@/lib/search";
import type { CustomPart, Vec3 } from "@/lib/types";

/** Known flags accepted by design: [flag prefix, reason]. */
const ACCEPTED: Record<string, [string, string]> = {
  "landscaper-retaining-wall": ["missing cored pieces", "segmental blocks modeled solid by design"],
  "cmu-block-foundation-wall": ["floating:", "10 mm mortar joints; mortar unmodeled by design"],
  "cmu-reinforced-bond-beam": ["floating:", "10 mm mortar joints; mortar unmodeled by design"],
  "bridge-abutment-formwork-waterstop": ["floating:", "waterstop slip-fit in split-bulkhead slot (7.5 mm/side)"],
};

const UP = JSON.parse(readFileSync("src/data/textbook-upgrades.json", "utf8")) as Record<string, unknown>;
const GEN = new Set((JSON.parse(readFileSync("src/data/generated-assemblies.json", "utf8")) as { entries: { slug: string }[] }).entries.map((e) => e.slug));
const inFile = (arr: { slug: string }[], s: string) => arr.some((e) => e.slug === s);
const sourceOf = (s: string) => (inFile(BOOK_ASSEMBLIES, s) ? "BOOK" : inFile(CHING_ASSEMBLIES, s) ? "CHING" : inFile(TRADES_MODULES, s) ? "TRADE" : "INLINE");

type Box = { min: Vec3; max: Vec3 };
function bbox(p: CustomPart): Box {
  if (!p.rot) {
    return { min: [p.pos[0] - p.size[0] / 2, p.pos[1] - p.size[1] / 2, p.pos[2] - p.size[2] / 2], max: [p.pos[0] + p.size[0] / 2, p.pos[1] + p.size[1] / 2, p.pos[2] + p.size[2] / 2] };
  }
  const e: Vec3 = [(p.rot[0] * Math.PI) / 180, (p.rot[1] * Math.PI) / 180, (p.rot[2] * Math.PI) / 180];
  const lo: Vec3 = [1e9, 1e9, 1e9], hi: Vec3 = [-1e9, -1e9, -1e9];
  for (const a of [-1, 1]) for (const c of [-1, 1]) for (const d of [-1, 1]) {
    const v = rotate([(a * p.size[0]) / 2, (c * p.size[1]) / 2, (d * p.size[2]) / 2], e);
    for (let i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], p.pos[i] + v[i]); hi[i] = Math.max(hi[i], p.pos[i] + v[i]); }
  }
  return { min: lo, max: hi };
}
function touches(a: Box, b: Box, tol = 6): boolean {
  let overlaps = 0;
  for (let i = 0; i < 3; i++) {
    const gap = Math.max(a.min[i], b.min[i]) - Math.min(a.max[i], b.max[i]);
    if (gap > tol) return false;
    // thin members (wires, gaskets) overlap less: scale the requirement to their extent
    const need = Math.min(4, Math.min(a.max[i] - a.min[i], b.max[i] - b.min[i]) * 0.5);
    if (-gap >= need) overlaps++;
  }
  return overlaps >= 2;
}

const EXPECT: { re: RegExp; except?: RegExp; need: string; test: (parts: CustomPart[]) => boolean }[] = [
  { re: /truss(?![ -]carrier)|rafter|gable|rake\b|pitched|lean-to|shed roof/i, except: /rough opening/i, need: "rotated member", test: (ps) => ps.some((p) => p.rot || (p.pieces ?? []).some((q) => (q as CustomPart).rot)) },
  { re: /fluted|corrugated|(?:steel|metal).{0,24}deck|deck panel/i, except: /dowel/i, need: "fluted profile", test: (ps) => ps.some((p) => p.profile?.kind === "fluted" || (p.pieces ?? []).some((q) => q.profile?.kind === "fluted")) },
  { re: /cant strip/i, need: "prism", test: (ps) => ps.some((p) => p.shape === "prism" || (p.pieces ?? []).some((q) => q.shape === "prism")) },
  { re: /cmu|concrete block|block wall|hollow.core/i, need: "cored pieces", test: (ps) => ps.some((p) => (p.pieces?.length ?? 0) > 0) },
  { re: /i-beam|wide-flange|\bW\d+x\d+|steel beam|steel girder/i, need: "ibeam profile", test: (ps) => ps.some((p) => p.profile?.kind === "ibeam" || (p.pieces ?? []).some((q) => q.profile?.kind === "ibeam") || ((p.pieces?.length ?? 0) >= 3 && /W\d+\s*x\s*\d+|wide.flange|i.beam/i.test(p.name))) },
  { re: /stringer|stair(?!.*rail)|tread/i, need: "sloped/piece stringer", test: (ps) => ps.some((p) => p.rot || (p.pieces?.length ?? 0) > 0) },
  { re: /pipe|conduit|rectangular duct|round duct|tube|rebar/i, need: "cyl member", test: (ps) => ps.some((p) => p.shape === "cyl" || (p.pieces ?? []).some((q) => q.shape === "cyl")) },
];

const _src = readFileSync("src/components/home/Sections.tsx", "utf8");
const _block = _src.slice(_src.indexOf("const CHING_TOPICS"));
const TAB_SLUGS = new Set([..._block.matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]).filter((s) => s.includes("-")));

let flagged = 0;
let accepted = 0;
const fresh: string[] = [];
for (const e of CONSTRUCTION_CATALOG) {
  const spec = catalogSpec(e.slug)!;
  const parts = spec.custom?.parts ?? [];
  const flags: string[] = [];
  // floating parts (no contact within 6mm of any other part)
  const boxes = parts.map(bbox);
  const floating = parts.filter((_, i) => parts.length > 1 && !boxes.some((b, j) => i !== j && touches(boxes[i], b))).map((p) => p.id);
  if (floating.length) flags.push(`floating: ${floating.slice(0, 4).join(",")}${floating.length > 4 ? `+${floating.length - 4}` : ""}`);
  // hardware coverage
  const plan = buildPlan(spec);
  let req = 0;
  for (const s of spec.custom?.steps ?? []) for (const f of s.fix ?? []) req += f.count;
  const got = plan.items.filter((i) => i.kind === "hw").length;
  if (req > 0 && got < req) flags.push(`hw ${got}/${req}`);
  // keyword expectations on name+variant+material
  const hay = `${e.name} ${e.variant} ${e.material ?? ""}`;
  for (const x of EXPECT) if (x.re.test(hay) && !(x.except && x.except.test(hay)) && !x.test(parts)) flags.push(`missing ${x.need}`);
  // reachability: searchable by a realistic short query (first 3 slug words)?
  const q = e.slug.split("-").slice(0, 3).join(" ");
  const hits = searchCatalog(q, 8).map((h) => h.entry.slug);
  if (!hits.includes(e.slug)) flags.push(`unsearchable(${q})`);
  if (!UP[e.slug] && !GEN.has(e.slug)) flags.push("not-upgraded");
  if (!TAB_SLUGS.has(e.slug) && e.category !== "Furniture & Interior") flags.push("no-tab");
  if (flags.length) {
    flagged++;
    const [prefix, reason] = ACCEPTED[e.slug] ?? [];
    const rest = prefix ? flags.filter((f) => !f.startsWith(prefix)) : flags;
    if (prefix && rest.length === 0) {
      accepted++;
      console.log(`${sourceOf(e.slug).padEnd(6)} ${e.slug}: accepted (${reason})`);
    } else {
      const line = `${sourceOf(e.slug).padEnd(6)} ${e.slug}: ${flags.join(" | ")}`;
      console.log(line);
      fresh.push(line);
    }
  }
}
console.log(`\nflagged ${flagged}/${CONSTRUCTION_CATALOG.length} (${accepted} accepted by design)`);
if (fresh.length) process.exit(1);
console.log("all good");
