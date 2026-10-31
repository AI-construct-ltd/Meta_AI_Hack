/**
 * Checks all non-IKEA textbook and construction assemblies.
 *
 *   npm run textbook:check
 *
 * Fails when an assembly doesn't build a plan, has no steps or parts, has broken coordinates,
 * when two assemblies share a slug or name and variant, or when a slug in scripts/textbook/slugs.json
 * or base-slugs.json no longer matches the expected assembly.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { CONSTRUCTION_CATALOG } from "@/data/construction-catalog";
import { toSpec } from "@/lib/catalog";
import { fold } from "@/lib/fold";
import { buildPlan } from "@/lib/plan";
import { matchCatalog } from "@/lib/search";
import type { Plan } from "@/lib/types";
import { classifyTextbook } from "./classify";

const DIR = import.meta.dirname;
const problems: string[] = [];
const fail = (s: string) => problems.push(s);

function finite(v: unknown): boolean {
  if (typeof v === "number") return Number.isFinite(v);
  if (Array.isArray(v)) return v.every(finite);
  if (v && typeof v === "object") return Object.values(v).every(finite);
  return true;
}

/** Every part's final position stays near the assembly's outer size. */
function fits(plan: Plan) {
  const { w, h, d } = plan.spec.size;
  const sizeOf = new Map(plan.parts.map((p) => [p.id, p.size]));
  for (const it of plan.items) {
    if (it.kind !== "part") continue;
    const s = sizeOf.get(it.ref);
    if (!s || s.some((v) => !(v > 0))) return `part ${it.ref} has no size`;
    const [x, y, z] = it.final.pos;
    if (Math.abs(x) > w * 5 + 300 || y < -300 || y > h * 10 + 600 || Math.abs(z) > d * 5 + 600) {
      return `part ${it.ref} sits outside the assembly footprint`;
    }
  }
  return null;
}

async function main() {
  const t0 = performance.now();
  const plans = new Map<string, Plan>();

  // 1. Classification, validation, and plan generation
  for (const raw of CONSTRUCTION_CATALOG) {
    const label = `${raw.slug} (${raw.name} - ${raw.variant})`;
    const res = classifyTextbook(raw);
    if ("reject" in res) {
      fail(`${label}: classify rejected - ${res.reject}`);
      continue;
    }

    const e = res.ok;
    const { w, h, d } = e.size;
    if (!(w >= 5 && w <= 2000 && h >= 2 && h <= 2000 && d >= 2 && d <= 2000)) {
      fail(`${label}: size ${w}x${h}x${d} cm is out of range`);
    }

    try {
      const plan = buildPlan(toSpec(e));
      plans.set(raw.slug, plan);
      if (!plan.steps.length) fail(`${label}: no steps in generated plan`);
      if (!plan.parts.length) fail(`${label}: no parts in generated plan`);
      if (!finite(plan.items) || !finite(plan.parts)) fail(`${label}: coordinate number in plan is not finite`);
      const off = fits(plan);
      if (off) fail(`${label}: ${off}`);
    } catch (err) {
      fail(`${label}: buildPlan threw ${(err as Error).message}`);
    }
  }
  const ms = performance.now() - t0;

  // 2. Slugs and names uniqueness
  const slugs = new Map<string, string>();
  const keys = new Set<string>();
  for (const e of CONSTRUCTION_CATALOG) {
    const key = fold(e.name) + "|" + fold(e.variant);
    if (slugs.has(e.slug)) fail(`slug ${e.slug} is used twice`);
    if (keys.has(key)) fail(`${e.name} ${e.variant} is listed twice`);
    slugs.set(e.slug, e.name + "|" + e.variant);
    keys.add(key);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.slug)) fail(`slug ${e.slug} has invalid characters`);
  }

  // 3. Slugs lock file checks
  const baseLockFile = path.join(DIR, "base-slugs.json");
  const base: Record<string, string> = existsSync(baseLockFile) ? JSON.parse(readFileSync(baseLockFile, "utf8")) : {};
  for (const [key, slug] of Object.entries(base)) {
    if (slugs.get(slug) !== key) fail(`base slug ${slug} no longer matches '${key}'`);
  }

  const lockFile = path.join(DIR, "slugs.json");
  const lock: Record<string, string> = existsSync(lockFile) ? JSON.parse(readFileSync(lockFile, "utf8")) : {};
  for (const [key, slug] of Object.entries(lock)) {
    const now = slugs.get(slug);
    if (now === undefined) fail(`locked slug ${slug} missing from textbook assemblies`);
    else if (now !== key) fail(`slug ${slug} was '${key}', now opens '${now}'`);
  }

  // 4. Search matching tests
  const expectSearch = (q: string, expectedSlug: string) => {
    const got = matchCatalog(q)?.slug ?? null;
    if (got !== expectedSlug) fail(`search "${q}" gave ${got}, expected ${expectedSlug}`);
  };

  expectSearch("wall framing 2x4", "wall-framing-2x4");
  expectSearch("monolithic slab", "monolithic-slab-foundation");
  expectSearch("cmu block foundation", "cmu-block-foundation-wall");
  expectSearch("triple 2x10 girder", "built-up-floor-girder");
  expectSearch("roof truss system", "roof-truss-system");
  expectSearch("straight staircase framing", "stair-stringer-assembly");
  expectSearch("gable roof framing", "gable-roof-framing");
  expectSearch("three stud corner assembly", "corner-post-framing");

  // 5. IKEA parity: identical members share one part type (one letter, a count),
  // and trade nails are full-size framing nails rather than 20 mm pins
  // every requested fastener must appear in 3D: a gap means joints that don't touch,
  // counts above the per-fix caps (48, 12 for brackets), or anchors to unmodeled structure
  for (const [slug, plan] of plans) {
    const entry = CONSTRUCTION_CATALOG.find((x) => x.slug === slug);
    let req = 0;
    for (const s of entry?.custom?.steps ?? []) for (const f of s.fix ?? []) req += f.count;
    const got = plan.items.filter((i) => i.kind === "hw").length;
    if (got !== req) fail(`${slug}: ${req} fasteners requested but ${got} placed; close the joint gaps or match the counts`);
  }
  // identical members share one part type (one letter, a count) instead of one row each
  for (const slug of ["wall-framing-2x4", "door-rough-opening"]) {
    const plan = plans.get(slug)!;
    const items = plan.items.filter((i) => i.kind === "part").length;
    if (!(items > plan.parts.length)) fail(`${slug}: identical members should share part types (${items} items, ${plan.parts.length} types)`);
    if (!plan.parts.some((p) => p.qty >= 2)) fail(`${slug}: expected at least one grouped multi-qty part type`);
  }
  for (const [slug, plan] of plans) {
    for (const h of plan.hardware) {
      if (h.kind === "nail" && h.len < 80) fail(`${slug}: trade nail is ${h.len} mm, expected a full-size (16d) framing nail`);
    }
  }
  // upgraded pilots must actually use the accurate-geometry vocabulary, not plain boxes
  const uses = (slug: string) => {
    const parts = CONSTRUCTION_CATALOG.find((x) => x.slug === slug)?.custom?.parts ?? [];
    return {
      profiles: parts.filter((p) => p.profile || (p.pieces ?? []).some((q) => q.profile)).length,
      rotated: parts.filter((p) => p.rot).length,
      pieces: parts.filter((p) => (p.pieces?.length ?? 0) > 0 || p.shape === "prism").length,
    };
  };
  if (!uses("steel-roof-deck-assembly").profiles) fail("steel-roof-deck-assembly: upgrade must use a fluted/ibeam profile");
  if (!uses("steel-roof-deck-assembly").pieces) fail("steel-roof-deck-assembly: upgrade must model joists/cant as pieces");
  if (!uses("heavy-timber-kingpost-truss").rotated) fail("heavy-timber-kingpost-truss: upgrade must rotate the rafters to pitch");
  if (!uses("cmu-block-foundation-wall").pieces) fail("cmu-block-foundation-wall: upgrade must model block cores as pieces");

  // 5b. Cylinder format: the engine builds radius from size[0] and ignores size[2],
  // so a non-circular size (extents-style [x,y,z]) builds the wrong solid
  for (const e of CONSTRUCTION_CATALOG) {
    for (const p of e.custom?.parts ?? []) {
      const all = [p, ...(p.pieces ?? [])];
      for (const q of all) {
        if (q.shape === "cyl" && q.size[0] !== q.size[2]) {
          fail(`${e.slug}: ${q.id} cyl size [${q.size}] is not circular; use [dia, len, dia] with rot`);
        }
      }
    }
  }

  // 6. Category breakdown
  const perCategory = new Map<string, number>();
  for (const e of CONSTRUCTION_CATALOG) {
    perCategory.set(e.category, (perCategory.get(e.category) ?? 0) + 1);
  }

  console.log(`\ntextbook / construction guides: ${CONSTRUCTION_CATALOG.length}`);
  console.log("per trade category:");
  for (const [cat, count] of [...perCategory].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat.padEnd(24)} ${String(count).padStart(3)}`);
  }
  console.log(`\nbuilt ${CONSTRUCTION_CATALOG.length} textbook plans in ${Math.round(ms)} ms`);

  if (problems.length) {
    console.log(`\n${problems.length} problems:`);
    for (const p of problems.slice(0, 50)) console.log("  " + p);
    process.exit(1);
  }
  console.log("\nall good");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
