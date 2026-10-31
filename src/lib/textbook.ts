import type { ConstructionEntry } from "@/data/construction-catalog";
import { CONSTRUCTION_CATALOG } from "@/data/construction-catalog";
import { fold } from "./fold";

export type TextbookCategory =
  | "Framing & Carpentry"
  | "Structural & Framing"
  | "Civil & Heavy"
  | "Finishing"
  | "Mechanical & Systems"
  | "Furniture & Interior"
  | "Specialty";

export const TEXTBOOK_CATEGORIES: TextbookCategory[] = [
  "Framing & Carpentry",
  "Structural & Framing",
  "Civil & Heavy",
  "Finishing",
  "Mechanical & Systems",
  "Furniture & Interior",
  "Specialty",
];

export const TEXTBOOK_ASSEMBLIES: ConstructionEntry[] = CONSTRUCTION_CATALOG;

const BY_SLUG = new Map<string, ConstructionEntry>(
  TEXTBOOK_ASSEMBLIES.map((a) => [a.slug, a])
);

const BY_NAME = new Map<string, ConstructionEntry>(
  TEXTBOOK_ASSEMBLIES.map((a) => [fold(a.name), a])
);

/** True when this slug belongs to a non-IKEA textbook or trade assembly. */
export function isTextbookSlug(slug: string): boolean {
  return BY_SLUG.has(slug);
}

/** True when this name matches a textbook or trade assembly. */
export function isTextbookName(name: string): boolean {
  return BY_NAME.has(fold(name));
}

/** Retrieve a textbook assembly by its unique slug. */
export function getTextbookAssembly(slug: string): ConstructionEntry | null {
  return BY_SLUG.get(slug) ?? null;
}

/** Retrieve all textbook assemblies in a given trade category. */
export function textbookAssembliesByCategory(category: TextbookCategory | string): ConstructionEntry[] {
  return TEXTBOOK_ASSEMBLIES.filter((a) => a.category.toLowerCase() === category.toLowerCase());
}

/** True for apprentice-training trade guides, as opposed to IKEA flat-pack or scanned manuals. */
export function isTextbookSpec(spec: { brand?: string }): boolean {
  return spec.brand === "Apprentice Training";
}
