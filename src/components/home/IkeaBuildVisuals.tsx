"use client";

import React from "react";
import Drawing from "@/components/Drawing";

const C = Math.cos(Math.PI / 6);
const S = 0.5;
const OX = 500;
const OY = 384;
type V = [number, number, number];
const P = ([x, y, z]: V): [number, number] => [OX + (x - z) * C, OY + (x + z) * S - y];
const poly = (...pts: V[]) => "M" + pts.map((p) => P(p).map((n) => n.toFixed(1)).join(" ")).join(" L") + " Z";

function box(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) {
  return {
    top: poly([x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]),
    right: poly([x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]),
    left: poly([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]),
  };
}

function dowel([x, y, z]: V, h: number, r = 6.5) {
  const [cx, top] = P([x, y + h, z]);
  const [, bot] = P([x, y, z]);
  const rx = r * 1.22;
  const ry = r * 0.7;
  return {
    body: `M${cx - rx} ${top} L${cx - rx} ${bot} A${rx} ${ry} 0 0 0 ${cx + rx} ${bot} L${cx + rx} ${top} Z`,
    cap: { cx, cy: top, rx, ry },
  };
}

const BOARD = box(-170, 170, 0, 26, -80, 80);
const DIVIDER = box(-8, 8, 112, 262, -80, 80);
const DOWELS = [dowel([0, 26, -48], 24), dowel([0, 26, 48], 24)];
const DONE = [dowel([-152, 26, -48], 14), dowel([-152, 26, 48], 14), dowel([152, 26, -48], 14), dowel([152, 26, 48], 14)];
const ARROW = { top: P([0, 344, 0]), tip: P([0, 280, 0]) };

/** Real IKEA KALLAX manual assembly step from the app, wordless with settling drop animation */
export function IkeaKallaxStep() {
  return (
    <svg viewBox="200 40 600 480" width={240} height={165} className="ikea-visual-svg" aria-hidden="true">
      <g strokeLinejoin="round" stroke="var(--ink)" strokeWidth={2.4} className="sc-model">
        <ellipse cx={P([0, 0, 0])[0] + 6} cy={P([0, 0, 0])[1] + 16} rx={250} ry={44} fill="#f1efe9" stroke="none" />
        <path d={BOARD.left} fill="#fff" />
        <path d={BOARD.right} fill="#efede7" />
        <path d={BOARD.top} fill="#fff" />
        {DONE.map((d, i) => (
          <g key={i} opacity={0.55}>
            <path d={d.body} fill="#f1e2c3" />
            <ellipse {...d.cap} fill="#f7edd6" />
          </g>
        ))}
        {DOWELS.map((d, i) => (
          <g key={i}>
            <path d={d.body} fill="#f1e2c3" />
            <ellipse {...d.cap} fill="#f7edd6" />
          </g>
        ))}
        {/* divider coming down onto dowels with arrow */}
        <g className="sc-drop">
          <path d={DIVIDER.left} fill="#fff2c2" />
          <path d={DIVIDER.right} fill="#f1e4b0" />
          <path d={DIVIDER.top} fill="#fff8dc" />
          <path
            d={`M${ARROW.top[0] - 7} ${ARROW.top[1]} h14 v${ARROW.tip[1] - ARROW.top[1] - 22} h10 l-17 22 l-17 -22 h10 z`}
            fill="var(--ink)"
            stroke="#fff"
            strokeWidth={2.4}
          />
        </g>
      </g>
    </svg>
  );
}

/** Real IKEA product drawing wrapper, without any text labels */
export function IkeaProductDrawing({ slug }: { slug: string }) {
  return (
    <div className="ikea-drawing-wrap">
      <Drawing name={slug} w={240} h={165} alt="" />
    </div>
  );
}
