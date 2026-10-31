import type { ConstructionEntry } from "./construction-catalog";
import DATA from "./generated-assemblies.json" with { type: "json" };

/** AI-generated textbook assemblies (scripts/textbook/expand.ts). Do not hand-edit; regenerate instead. */
export const GENERATED_ASSEMBLIES: ConstructionEntry[] = (DATA as unknown as { entries: ConstructionEntry[] }).entries;
