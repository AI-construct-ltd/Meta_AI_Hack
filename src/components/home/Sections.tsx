"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { POPULAR, articleNo, fold, kindOf, loadArticles, searchCatalog, searchText, slugify } from "@/lib/search";
import { articleSlug } from "@/lib/ikea";
import { PRODUCTS, toSpec, type CatalogEntry } from "@/lib/catalog";
import { KIND_ARCH, type Kind } from "@/lib/products";
import type { Archetype } from "@/lib/types";
import Drawing from "../Drawing";
import Thumb from "../Thumb";
import { buildPlan } from "@/lib/plan";
import { useUserKey } from "@/lib/userKey";
import { Dots } from "../guide/ui";
import { IArrowRight, IClock, IClose, ISearch } from "../art/Icons";

/** Top-level topics bar: The Building, Systems 3-11 (with Mechanical & Electrical separated), and Furniture & Interior (parent). */
export const CATS: { id: string; label: string; kinds?: Kind[]; tag?: string }[] = [
  { id: "all", label: "All" },
  { id: "building", label: "The Building" },
  { id: "foundations", label: "Foundation Systems" },
  { id: "floors", label: "Floor Systems" },
  { id: "walls", label: "Wall Systems" },
  { id: "roofs", label: "Roof Systems" },
  { id: "moisture-thermal", label: "Moisture & Thermal Protection" },
  { id: "doors-windows", label: "Doors & Windows" },
  { id: "special", label: "Special Construction" },
  { id: "finish", label: "Finish Work" },
  { id: "mechanical", label: "Mechanical Systems" },
  { id: "electrical", label: "Electrical Systems" },
  { id: "interior", label: "Furniture & Interior", tag: "interior" },
];

/** Child topics contained inside Furniture & Interior (Chairs, Sofas, Tables, Desks, Beds, Shelves, Cabinets, Drawers, Wardrobes, Outdoor). */
export const FURNITURE_SUB_CATS: { id: string; label: string; kinds?: Kind[]; tag?: string }[] = [
  { id: "seating", label: "Chairs", kinds: ["chair", "stool", "bench", "backbench", "office", "conference", "highchair", "junior", "lounge"] },
  { id: "sofas", label: "Sofas", kinds: ["sofa", "armchair", "corner", "usofa", "section", "chaise", "swivel", "lounger"] },
  { id: "tables", label: "Tables", kinds: ["dining", "coffee", "side", "bar", "console", "trolley", "dropleaf", "gateleg", "conftable"] },
  { id: "desks", label: "Desks", kinds: ["desk", "cornerdesk"] },
  { id: "beds", label: "Beds", kinds: ["bed", "daybed", "bunk", "loft", "cot"] },
  { id: "shelves", label: "Shelves", kinds: ["cube", "bookcase", "open", "wallshelf", "bookrow", "divider"] },
  {
    id: "storage",
    label: "Cabinets",
    kinds: ["cabinet", "sideboard", "tv", "shoe", "shoerack", "wallcab", "kitchen", "cabrow", "slidecab", "mixed", "cornercab", "sinkcab", "appliance", "washstand"],
  },
  { id: "drawers", label: "Drawers", kinds: ["chest", "nightstand", "changing"] },
  { id: "wardrobes", label: "Wardrobes", kinds: ["wardrobe", "sliding", "cornerrobe", "clothesrack"] },
  { id: "outdoor", label: "Outdoor", tag: "outdoor" },
];

/** Detailed sub-categories for all interior furniture. */
export const INTERIOR_CATS: { id: string; label: string; kinds?: Kind[]; tag?: string }[] = [
  { id: "all", label: "All Interiors" },
  ...FURNITURE_SUB_CATS,
];

const CHING_TOPICS: Record<string, string[]> = {
  building: [
    "heavy-equipment-trenching",
    "crane-operator-rigging",
    "pipelayer-gravity-sewer",
    "truck-driver-hauling",
    "dredger-cutterhead-system",
    "construction-laborer-tasks",
    "landscaper-retaining-wall",
    "millwright-machine-alignment",
    "sign-display-pylon",
    "fencer-security-system",
  ],
  foundations: [
    "foundation-mudsill-assembly",
    "monolithic-slab-foundation",
    "cmu-block-foundation-wall",
    "isolated-column-footing",
    "stepped-foundation-wall",
    "steel-fixer-rebar-cage",
    "pile-driver-hpile",
  ],
  floors: [
    "shed-floor-deck",
    "built-up-floor-girder",
    "floor-joist-bridging-system",
    "stairwell-floor-opening",
    "open-web-steel-joist-deck",
    "precast-hollow-core-slab",
    "timber-post-beam-connection",
  ],
  walls: [
    "wall-framing-2x4",
    "corner-post-framing",
    "partition-tee-framing",
    "light-gauge-steel-stud-wall",
    "masonry-cavity-wall-assembly",
    "tilt-up-concrete-wall-panel",
    "bevel-lap-siding-system",
    "ironworker-steel-erector",
  ],
  roofs: [
    "gable-roof-framing",
    "hip-roof-framing",
    "roof-truss-system",
    "steel-roof-deck-assembly",
    "heavy-timber-kingpost-truss",
    "ceiling-joist-strongback",
    "eave-soffit-overhang",
    "gable-rake-overhang",
  ],
  "moisture-thermal": [
    "roofing-shingle-system",
    "single-ply-tpo-roof-assembly",
    "rainscreen-curtain-wall-facade",
    "foundation-waterproofing-drain",
    "insulation-thermal-envelope",
  ],
  "doors-windows": [
    "door-rough-opening",
    "window-rough-opening",
    "window-flashing-installation",
    "hollow-metal-doorframe-assembly",
    "aluminum-curtain-wall-stick-system",
    "interior-door-hanging",
  ],
  special: [
    "stair-stringer-assembly",
    "steel-pan-concrete-stairs",
    "masonry-fireplace-smoke-chamber",
  ],
  finish: [
    "drywall-hanging-finishing",
    "interior-trim-molding",
    "suspended-acoustic-ceiling-grid",
    "ceramic-tile-uncoupling-membrane",
    "carpet-flooring-installation",
    "kitchen-cabinet-installation",
    "cabinet-making-casework",
    "furniture-assembly-guide",
    "painter-decorator-system",
    "plasterer-stucco-lath",
  ],
  mechanical: [
    "plumbing-dwv-supply",
    "hvac-ductwork-assembly",
    "pipefitter-flanged-spool",
    "sheet-metal-fabrication",
    "boilermaker-pressure-vessel",
    "fire-sprinkler-wet-system",
  ],
  electrical: [
    "electrician-service-panel",
    "lineman-power-pole",
    "elevator-mechanic-rails",
    "raised-access-flooring-system",
  ],
};

const LISTED = new Set(FURNITURE_SUB_CATS.flatMap((c) => c.kinds ?? []));
const LISTED_INTERIOR = new Set(INTERIOR_CATS.flatMap((c) => c.kinds ?? []));
const BY_ARCH: Record<Archetype, string> = {
  shelf: "shelves",
  drawers: "drawers",
  cabinet: "storage",
  table: "tables",
  bed: "beds",
  seat: "seating",
  sofa: "sofas",
  custom: "framing",
};

export const inCat = (e: CatalogEntry, c: { id: string; kinds?: Kind[]; tag?: string }) => {
  if (c.id === "all") return true;
  if (c.id in CHING_TOPICS) {
    return CHING_TOPICS[c.id].includes(e.slug);
  }
  if (c.id === "interior") {
    return e.archetype !== "custom" || e.category === "Furniture & Interior";
  }
  if (e.archetype === "custom") return false;
  if (c.kinds && e.kind && c.kinds.includes(e.kind)) return true;
  if (e.kind && !LISTED.has(e.kind) && BY_ARCH[KIND_ARCH[e.kind] ?? e.archetype] === c.id) return true;
  if (c.tag && e.keywords?.includes(c.tag)) return true;
  return false;
};

export const inInteriorCat = (e: CatalogEntry, c: { id: string; kinds?: Kind[]; tag?: string }) => {
  if (e.category === "Framing & Carpentry" || e.keywords?.includes("framing") || e.archetype === "custom") return false;
  if (c.id === "all") return true;
  if (c.kinds && e.kind && c.kinds.includes(e.kind)) return true;
  if (e.kind && !LISTED_INTERIOR.has(e.kind) && BY_ARCH[KIND_ARCH[e.kind] ?? e.archetype] === c.id) return true;
  if (c.tag && e.keywords?.includes(c.tag)) return true;
  return false;
};

/** Cards added per "Show more": a multiple of the 2 and 3 column grids. */
const PAGE = 36;

export function ProductCard({ e, i = 0 }: { e: CatalogEntry; i?: number }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.4, delay: Math.min(0.3, (i % 12) * 0.03), ease: [0.22, 1, 0.36, 1] }}>
      <Link href={`/build/${e.slug}`} className="pcard">
        <span className="pcard-art">
          {e.archetype === "custom" ? (
            <Thumb id={e.slug} plan={() => buildPlan(toSpec(e))} mode={{ kind: "assembled" }} w={420} h={320} className="pcard-thumb" alt={`${e.name} line drawing`} lazy={i >= 6} />
          ) : (
            <Drawing name={e.slug} fallback={e.kind ? `kind-${e.kind}` : undefined} w={420} h={320} className="pcard-thumb" alt={`${e.name} line drawing`} eager={i < 6} />
          )}
        </span>
        <span className="pcard-text">
          <span className="pcard-top">
            <b>{e.name}</b>
            <span className="pcard-go">
              <IArrowRight size={17} />
            </span>
          </span>
          <span className="pcard-variant">{e.variant}</span>
          <span className="pcard-meta">
            <span>
              <IClock size={15} /> {e.minutes < 60 ? `${e.minutes} min` : `${Math.round(e.minutes / 6) / 10} h`}
            </span>
            <Dots value={e.difficulty} />
            <span className="pcard-cat">{e.category}</span>
          </span>
        </span>
      </Link>
    </motion.div>
  );
}

/**
 * Category tabs plus a grid. On the home page it shows a short pick; /interiors shows everything with a filter,
 * a page of cards at a time (each card's drawing renders only while it is on screen).
 */
export function Catalog({ limit, search, section = "all" }: { limit?: number; search?: boolean; section?: "all" | "interiors" }) {
  const categories = section === "interiors" ? INTERIOR_CATS : CATS;
  const filterFn = section === "interiors" ? inInteriorCat : inCat;
  const [cat, setCat] = useState(section === "interiors" ? "interior" : "all");
  const [subCat, setSubCat] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [more, setMore] = useState({ view: "", n: PAGE });
  const [articles, setArticles] = useState(false);
  const no = search ? articleNo(q) : null;

  useEffect(() => {
    if (no && !articles) loadArticles().then(() => setArticles(true));
  }, [no, articles]);

  const baseProducts = useMemo(() => {
    if (section === "interiors") {
      return PRODUCTS.filter((e) => e.category !== "Framing & Carpentry" && !e.keywords?.includes("framing") && e.archetype !== "custom");
    }
    return PRODUCTS;
  }, [section]);

  const counts = useMemo(
    () => (search ? new Map(categories.map((c) => [c.id, baseProducts.filter((e) => filterFn(e, c)).length])) : null),
    [search, categories, baseProducts, filterFn]
  );

  const subCounts = useMemo(
    () => (search ? new Map(FURNITURE_SUB_CATS.map((c) => [c.id, baseProducts.filter((e) => inCat(e, c)).length])) : null),
    [search, baseProducts]
  );

  const list = useMemo(() => {
    let targetObj: { id: string; kinds?: Kind[]; tag?: string } | undefined;
    if ((cat === "interior" || section === "interiors") && subCat) {
      targetObj = FURNITURE_SUB_CATS.find((x) => x.id === subCat);
    } else {
      targetObj = categories.find((x) => x.id === cat);
    }
    const c = targetObj || categories[0];
    let l = c.kinds || c.tag || c.id !== "all" ? baseProducts.filter((e) => inCat(e, c)) : limit ? POPULAR : baseProducts;
    const f = fold(q);
    let ranked = false;
    if (no) {
      const slug = articles ? articleSlug(no) : null;
      l = l.filter((e) => e.slug === slug);
    } else if (f) {
      // every word starts a word of the product's name, type, category or keywords
      const words = f.split(" ");
      const literal = l.filter((e) => {
        const text = searchText(e);
        return words.every((w) => text.includes(" " + w));
      });
      // a type word ("crib", "desk chair") or a typo ("kalax") goes through the same search as the home page, best first
      if (kindOf(q) || !literal.length) {
        const inView = new Set(l);
        const hits = searchCatalog(q, 600).map((h) => h.entry).filter((e) => inView.has(e));
        const seen = new Set(hits);
        l = [...hits, ...literal.filter((e) => !seen.has(e))];
        ranked = hits.length > 0;
      } else l = literal;
    }
    if (!limit && !ranked) {
      l = [...l].sort((a, b) => {
        const aCustom = a.archetype === "custom";
        const bCustom = b.archetype === "custom";
        if (aCustom && !bCustom) return -1;
        if (!aCustom && bCustom) return 1;
        return a.name.localeCompare(b.name, "sv") || a.variant.localeCompare(b.variant, "sv");
      });
    }
    return limit ? l.slice(0, limit) : l;
  }, [cat, subCat, q, limit, no, articles, categories, baseProducts, filterFn]);

  const view = cat + "|" + (subCat ?? "") + "|" + q;
  const n = limit ? list.length : more.view === view ? more.n : PAGE;
  const shown = list.slice(0, n);

  return (
    <div className="catalog">
      <div className="cat-bar">
        {search && (
          <label className="cat-search">
            <ISearch size={20} />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or article number" aria-label="Filter by name or article number" enterKeyHint="search" autoComplete="off" spellCheck={false} />
            {q && (
              <button type="button" className="cat-clear" onClick={() => setQ("")} aria-label="Clear filter">
                <IClose size={16} />
              </button>
            )}
          </label>
        )}
        <div className="cat-tabs" role="tablist">
          {categories.map((c) => {
            const on = cat === c.id;
            return (
              <button
                key={c.id}
                role="tab"
                aria-selected={on}
                className={"cat-tab" + (on ? " on" : "")}
                onClick={() => {
                  setCat(c.id);
                  if (c.id !== "interior") setSubCat(null);
                }}
              >
                {on && <motion.i layoutId={"cat-bg" + (search ? "b" : "h")} className="cat-bg" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                <span>{c.label}</span>
                {counts && <small className="cat-n">{counts.get(c.id)}</small>}
              </button>
            );
          })}
        </div>
      </div>

      {(cat === "interior" || section === "interiors") && (
        <div className="cat-sub-bar" role="tablist" aria-label="Furniture & Interior topics">
          <span className="cat-sub-label">Interior Topics:</span>
          <button
            type="button"
            role="tab"
            aria-selected={!subCat}
            className={"cat-sub-chip" + (!subCat ? " on" : "")}
            onClick={() => setSubCat(null)}
          >
            <span>All Furniture &amp; Interior</span>
            {counts && <small className="cat-n">{counts.get("interior") ?? 2190}</small>}
          </button>
          {FURNITURE_SUB_CATS.map((s) => {
            const on = subCat === s.id;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={on}
                className={"cat-sub-chip" + (on ? " on" : "")}
                onClick={() => setSubCat(s.id)}
              >
                <span>{s.label}</span>
                {subCounts && <small className="cat-n">{subCounts.get(s.id)}</small>}
              </button>
            );
          })}
        </div>
      )}
      <motion.div layout className="pgrid">
        <AnimatePresence mode="popLayout">
          {shown.map((e, i) => (
            <ProductCard key={e.slug} e={e} i={i} />
          ))}
        </AnimatePresence>
      </motion.div>
      {list.length === 0 && (
        <div className="empty">
          {no && !articles ? (
            <p>Looking up that article number</p>
          ) : no ? (
            <p>No guide for that article number yet. Try the name on the box.</p>
          ) : (
            <>
              <p>Nothing here matches &ldquo;{q.trim()}&rdquo;.</p>
              <Link href={`/build/${slugify(q)}?q=${encodeURIComponent(q.trim())}`} className="empty-go">
                Make a guide for {q.trim()} <IArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
      )}
      {!limit && list.length > shown.length && (
        <div className="cat-more">
          <button type="button" className="cat-more-btn" onClick={() => setMore({ view, n: n + PAGE })}>
            Show {Math.min(PAGE, list.length - shown.length)} more
          </button>
          <span>
            {shown.length} of {list.length}
          </span>
        </div>
      )}
    </div>
  );
}

/** AI features run on the person's own key: they're on once one is saved. */
export function useAiStatus() {
  return !!useUserKey();
}
