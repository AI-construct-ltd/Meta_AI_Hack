/**
 * Decides what each textbook / construction assembly is in our terms:
 * category, trade, normalized dimensions, parts, hardware fixings, and assembly steps.
 * Used by build.ts and check.ts.
 */
import type { ConstructionEntry } from "@/data/construction-catalog";
import type { CustomPart, CustomStep, HwKind, PartMaterial, ToolId, WarnId } from "@/lib/types";

export type TextbookCategory =
  | "Framing & Carpentry"
  | "Structural & Framing"
  | "Civil & Heavy"
  | "Finishing"
  | "Mechanical & Systems"
  | "Furniture & Interior"
  | "Specialty";

export interface ClassifiedAssembly extends ConstructionEntry {
  category: TextbookCategory;
  boundingBoxMm: { w: number; h: number; d: number };
}

export type Verdict = { ok: ClassifiedAssembly } | { reject: string };

const VALID_CATEGORIES = new Set<TextbookCategory>([
  "Framing & Carpentry",
  "Structural & Framing",
  "Civil & Heavy",
  "Finishing",
  "Mechanical & Systems",
  "Furniture & Interior",
  "Specialty",
]);

const VALID_MATERIALS = new Set<PartMaterial>(["board", "fiber", "wood", "metal", "soft"]);

const FASTENER_TOOLS: Partial<Record<HwKind, ToolId>> = {
  nail: "hammer",
  screw: "screwdriver",
  bolt: "allen",
  camScrew: "screwdriver",
  cam: "screwdriver",
  bracket: "drill",
  hinge: "screwdriver",
  legScrew: "wrench",
};

/**
 * Parses construction textbook dimensions in inches ("2x4", "8x8x16 in", "48x48x14 in", "16 in O.C.")
 * or metric ("180x50x180 cm", "2400x38x89 mm").
 */
export function measureTextbook(s: string): { w: number; h: number; d: number; unit: "cm" | "mm" | "in" } | null {
  const t = s.trim().replace(/\s+/g, " ");
  // e.g. "180x50x180 cm" or "180 x 50 x 180 cm"
  const cmMatch = t.match(/^(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)(?:\s*[x×]\s*(\d+(?:\.\d+)?))?\s*cm$/i);
  if (cmMatch) {
    return {
      w: Number(cmMatch[1]),
      h: Number(cmMatch[2]),
      d: cmMatch[3] ? Number(cmMatch[3]) : 0,
      unit: "cm",
    };
  }
  // e.g. "48x48x14 in"
  const inMatch = t.match(/^(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)(?:\s*[x×]\s*(\d+(?:\.\d+)?))?\s*in(?:ches)?$/i);
  if (inMatch) {
    return {
      w: Math.round(Number(inMatch[1]) * 2.54),
      h: Math.round(Number(inMatch[2]) * 2.54),
      d: inMatch[3] ? Math.round(Number(inMatch[3]) * 2.54) : 0,
      unit: "in",
    };
  }
  return null;
}

/**
 * Computes the minimum bounding box in mm from parts.
 */
export function computeBoundingBoxMm(parts: CustomPart[]): { w: number; h: number; d: number } {
  if (!parts.length) return { w: 0, h: 0, d: 0 };
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (const p of parts) {
    const halfX = p.size[0] / 2;
    const halfY = p.size[1] / 2;
    const halfZ = p.size[2] / 2;
    minX = Math.min(minX, p.pos[0] - halfX);
    maxX = Math.max(maxX, p.pos[0] + halfX);
    minY = Math.min(minY, p.pos[1] - halfY);
    maxY = Math.max(maxY, p.pos[1] + halfY);
    minZ = Math.min(minZ, p.pos[2] - halfZ);
    maxZ = Math.max(maxZ, p.pos[2] + halfZ);
  }

  return {
    w: Math.round(maxX - minX),
    h: Math.round(maxY - minY),
    d: Math.round(maxZ - minZ),
  };
}

/**
 * Normalizes and infers material from part name or description.
 */
export function inferMaterial(name: string, explicit?: PartMaterial): PartMaterial {
  if (explicit && VALID_MATERIALS.has(explicit)) return explicit;
  const n = name.toLowerCase();
  if (/concrete|stone|gravel|cmu|block|brick|mortar|grout|slab|plaster|stucco|drywall|sheetrock|gypsum|tile/.test(n)) return "board";
  if (/poly|membrane|vapor|paper|felt|carpet|pad|insulation|batt|mat|fiber|lath/.test(n)) return "fiber";
  if (/steel|metal|rebar|bolt|bracket|channel|plate|rod|pipe|duct|wire|nail|screw|aluminum|flange|truss plate/.test(n)) return "metal";
  if (/wood|lumber|timber|stud|joist|rafter|beam|girder|post|plywood|osb|sill|fir|pine|cedar|blocking|fascia|subfloor/.test(n)) return "wood";
  if (/cushion|fabric|seat|upholster/.test(n)) return "soft";
  return "wood";
}

/**
 * Normalizes tools for a step, adding tools required by fasteners if omitted.
 */
export function normalizeTools(step: CustomStep): ToolId[] {
  const tools = new Set<ToolId>(step.tools ?? []);
  for (const f of step.fix ?? []) {
    const t = FASTENER_TOOLS[f.kind];
    if (t) tools.add(t);
  }
  const text = (step.title + " " + (step.detail ?? "")).toLowerCase();
  if (/level|plumb/.test(text)) tools.add("level");
  if (/tape|measure|layout|mark/.test(text)) tools.add("tape");
  if (/pencil|mark/.test(text)) tools.add("pencil");
  if (/hammer|nail/.test(text)) tools.add("hammer");
  if (/cut|trim|knife/.test(text)) tools.add("knife");
  if (/drill|anchor/.test(text)) tools.add("drill");
  return [...tools];
}

/**
 * Normalizes warnings for a step.
 */
export function normalizeWarnings(step: CustomStep): WarnId[] {
  const warnings = new Set<WarnId>(step.warnings ?? []);
  if ((step.people ?? 1) >= 2) warnings.add("two");
  const text = (step.title + " " + (step.detail ?? "")).toLowerCase();
  if (/floor|subfloor|flat/.test(text) && !warnings.has("floor")) warnings.add("floor");
  if (/wall|anchor|stud|bracket/.test(text) && !warnings.has("wall")) warnings.add("wall");
  return [...warnings].slice(0, 3);
}

/**
 * Normalizes parts: labels A..Z, materials, finite coords.
 */
export function normalizeParts(parts: CustomPart[]): CustomPart[] {
  return parts.map((p, idx) => ({
    ...p,
    label: p.label || String.fromCharCode(65 + (idx % 26)),
    material: inferMaterial(p.name, p.material),
    shape: p.shape ?? (p.size[0] === p.size[2] && p.name.toLowerCase().includes("pipe") ? "cyl" : "box"),
    size: [Math.round(p.size[0]), Math.round(p.size[1]), Math.round(p.size[2])],
    pos: [Math.round(p.pos[0]), Math.round(p.pos[1]), Math.round(p.pos[2])],
  }));
}

/**
 * Classifies and standardizes any non-IKEA textbook or trade assembly.
 */
export function classifyTextbook(raw: ConstructionEntry): Verdict {
  if (!raw.slug) return { reject: "missing slug" };
  if (!raw.name) return { reject: `${raw.slug}: missing name` };
  if (!raw.variant) return { reject: `${raw.slug}: missing variant` };

  const category = (raw.category as TextbookCategory) || "Framing & Carpentry";
  if (!VALID_CATEGORIES.has(category)) {
    return { reject: `${raw.slug}: invalid category '${raw.category}'` };
  }

  const custom = raw.custom;
  if (!custom || !custom.parts?.length || !custom.steps?.length) {
    return { reject: `${raw.slug}: missing custom parts or steps` };
  }

  const bb = computeBoundingBoxMm(custom.parts);
  const normParts = normalizeParts(custom.parts);
  const normSteps: CustomStep[] = custom.steps.map((st) => ({
    ...st,
    tools: normalizeTools(st),
    warnings: normalizeWarnings(st),
    pose: st.pose ?? "+y",
  }));

  const classified: ClassifiedAssembly = {
    ...raw,
    category,
    archetype: "custom",
    brand: raw.brand || "Apprentice Training",
    checked: true,
    size: {
      w: raw.size?.w ?? Math.max(10, Math.round(bb.w / 10)),
      h: raw.size?.h ?? Math.max(2, Math.round(bb.h / 10)),
      d: raw.size?.d ?? Math.max(2, Math.round(bb.d / 10)),
    },
    minutes: raw.minutes ?? Math.max(15, normSteps.length * 15),
    people: raw.people ?? (normSteps.some((s) => (s.people ?? 1) >= 2 || s.warnings?.includes("two")) ? 2 : 1),
    difficulty: raw.difficulty ?? Math.min(3, Math.max(1, Math.round(normParts.length / 4))),
    keywords: raw.keywords ?? [category.toLowerCase(), "apprentice", "trade"],
    custom: {
      parts: normParts,
      steps: normSteps,
    },
    boundingBoxMm: bb,
  };

  return { ok: classified };
}
