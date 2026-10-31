/**
 * Compiles and validates all non-IKEA textbook and construction assemblies.
 *
 *   npm run textbook:build
 *
 * Ensures every textbook assembly classifies cleanly, synchronizes scripts/textbook/slugs.json,
 * and verifies that every hand-made base slug in base-slugs.json remains intact.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { CONSTRUCTION_CATALOG } from "@/data/construction-catalog";
import { classifyTextbook, type ClassifiedAssembly } from "./classify";

const DIR = import.meta.dirname;
const SLUGS_LOCK = path.join(DIR, "slugs.json");
const BASE_LOCK = path.join(DIR, "base-slugs.json");

function main() {
  console.log("Building and standardizing textbook assemblies...");

  const existingLock: Record<string, string> = existsSync(SLUGS_LOCK)
    ? JSON.parse(readFileSync(SLUGS_LOCK, "utf8"))
    : {};
  const baseLock: Record<string, string> = existsSync(BASE_LOCK)
    ? JSON.parse(readFileSync(BASE_LOCK, "utf8"))
    : {};

  const classified: ClassifiedAssembly[] = [];
  const nextLock: Record<string, string> = { ...existingLock };
  const seenSlugs = new Set<string>();

  for (const raw of CONSTRUCTION_CATALOG) {
    const res = classifyTextbook(raw);
    if ("reject" in res) {
      console.error(`Error classifying ${raw.slug}:`, res.reject);
      process.exit(1);
    }

    const item = res.ok;
    const key = `${item.name}|${item.variant}`;

    if (seenSlugs.has(item.slug)) {
      console.error(`Duplicate slug detected: ${item.slug}`);
      process.exit(1);
    }
    seenSlugs.add(item.slug);

    if (baseLock[key] && baseLock[key] !== item.slug) {
      console.error(`Base slug mismatch for '${key}': lock has '${baseLock[key]}', entry has '${item.slug}'`);
      process.exit(1);
    }

    nextLock[key] = item.slug;
    classified.push(item);
  }

  // Sort keys alphabetically for clean diffs
  const sortedLock: Record<string, string> = {};
  for (const key of Object.keys(nextLock).sort()) {
    sortedLock[key] = nextLock[key];
  }
  writeFileSync(SLUGS_LOCK, JSON.stringify(sortedLock, null, 2) + "\n");

  const byCat = new Map<string, number>();
  for (const item of classified) {
    byCat.set(item.category, (byCat.get(item.category) ?? 0) + 1);
  }

  console.log(`\nSuccessfully classified and verified ${classified.length} textbook assemblies:`);
  for (const [cat, count] of byCat) {
    console.log(`  - ${cat}: ${count}`);
  }
  console.log(`Updated ${SLUGS_LOCK} (${Object.keys(sortedLock).length} locked slugs).`);
}

main();
