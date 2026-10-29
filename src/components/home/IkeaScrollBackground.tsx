"use client";

import { IkeaKallaxStep, IkeaProductDrawing } from "./IkeaBuildVisuals";

const ROW_1 = [
  { type: "step" },
  { type: "drawing", slug: "kallax-2x2" },
  { type: "drawing", slug: "malm-6-drawers" },
  { type: "drawing", slug: "bekvam-kitchen-trolley-58-x-50" },
  { type: "drawing", slug: "docksta-table-103" },
  { type: "drawing", slug: "trofast-desk-storage-boxes-trays-124-x-44-x-52" },
  { type: "drawing", slug: "bror-work-bench-110-x-55" },
  { type: "drawing", slug: "pax-frame" },
];

const ROW_2 = [
  { type: "drawing", slug: "billy-80x202" },
  { type: "step" },
  { type: "drawing", slug: "lack-side-table" },
  { type: "drawing", slug: "hemnes-shoe-cabinet-2-compartments" },
  { type: "drawing", slug: "sniglar-changing-table-53-x-72-x-87" },
  { type: "drawing", slug: "lagkapten-alex-desk-120-x-60" },
  { type: "drawing", slug: "kallax-4x4" },
  { type: "drawing", slug: "lovbacken-side-table-77-x-39" },
];

export default function IkeaScrollBackground() {
  const row1Duplicated = [...ROW_1, ...ROW_1, ...ROW_1];
  const row2Duplicated = [...ROW_2, ...ROW_2, ...ROW_2];

  return (
    <div className="ikea-bg-scroller" aria-hidden="true">
      {/* Top track */}
      <div className="ikea-bg-track track-left">
        {row1Duplicated.map((item, idx) => (
          <div key={`r1-${idx}`} className="ikea-visual-card">
            <div className="ikea-visual-inner" style={{ animationDelay: `${(idx % 4) * 0.45}s` }}>
              {item.type === "step" ? <IkeaKallaxStep /> : <IkeaProductDrawing slug={item.slug!} />}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom track */}
      <div className="ikea-bg-track track-right">
        {row2Duplicated.map((item, idx) => (
          <div key={`r2-${idx}`} className="ikea-visual-card">
            <div className="ikea-visual-inner" style={{ animationDelay: `${(idx % 4) * 0.45 + 0.2}s` }}>
              {item.type === "step" ? <IkeaKallaxStep /> : <IkeaProductDrawing slug={item.slug!} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
