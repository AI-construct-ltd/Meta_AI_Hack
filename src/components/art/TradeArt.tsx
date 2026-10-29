import React from "react";

const S = { stroke: "var(--ink)", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const W = "#ffffff";
const G = "#ecebe6";
const A = "var(--accent-soft)";

export function TradeArt({ tradeId, size = 120, className }: { tradeId: string; size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 160 120" width={size * (160 / 120)} height={size} className={"trade-art " + (className ?? "")} aria-hidden="true">
      {ART[tradeId] ?? DEFAULT_ART}
    </svg>
  );
}

const DEFAULT_ART = (
  <g {...S}>
    <rect x="30" y="25" width="100" height="70" rx="8" fill={W} />
    <path d="M50 45 h60 M50 60 h60 M50 75 h40" strokeWidth="2" />
  </g>
);

const ART: Record<string, React.ReactNode> = {
  interiors: (
    <g {...S}>
      {/* 3D isometric flat-pack side table with cam screw & Allen bolt */}
      <path d="M40 40 L80 20 L120 40 L80 60 Z" fill={W} strokeWidth="2.2" />
      <path d="M40 40 V50 L80 70 V60 Z" fill={G} />
      <path d="M120 40 V50 L80 70 V60 Z" fill={W} />
      {/* Table legs */}
      <path d="M44 52 V95 h8 V56 Z" fill={G} />
      <path d="M108 52 V95 h8 V56 Z" fill={G} />
      <path d="M76 68 V110 h8 V72 Z" fill={W} />
      {/* Cam bolt and Allen key hint */}
      <circle cx="125" cy="85" r="14" fill={A} />
      <path d="M120 85 h10 M125 80 v10" strokeWidth="2" />
    </g>
  ),
  "furniture-maker": (
    <g {...S}>
      {/* 3D isometric flat-pack side table with cam screw & Allen bolt */}
      <path d="M40 40 L80 20 L120 40 L80 60 Z" fill={W} strokeWidth="2.2" />
      <path d="M40 40 V50 L80 70 V60 Z" fill={G} />
      <path d="M120 40 V50 L80 70 V60 Z" fill={W} />
      {/* Table legs */}
      <path d="M44 52 V95 h8 V56 Z" fill={G} />
      <path d="M108 52 V95 h8 V56 Z" fill={G} />
      <path d="M76 68 V110 h8 V72 Z" fill={W} />
      {/* Cam bolt and Allen key hint */}
      <circle cx="125" cy="85" r="14" fill={A} />
      <path d="M120 85 h10 M125 80 v10" strokeWidth="2" />
    </g>
  ),
  "cabinet-maker": (
    <g {...S}>
      {/* Base cabinet face-frame with shaker doors and drawer */}
      <rect x="35" y="20" width="90" height="85" rx="3" fill={W} />
      <rect x="42" y="26" width="76" height="20" rx="2" fill={G} />
      <circle cx="80" cy="36" r="2.5" fill="var(--ink)" />
      <rect x="42" y="50" width="36" height="50" rx="2" fill={G} />
      <rect x="82" y="50" width="36" height="50" rx="2" fill={G} />
      <circle cx="72" cy="75" r="2" fill="var(--ink)" />
      <circle cx="88" cy="75" r="2" fill="var(--ink)" />
    </g>
  ),
  "interior-trim": (
    <g {...S}>
      {/* Miter box / crown molding profile and baseboard */}
      <path d="M30 35 L70 15 L130 15 L90 35 Z" fill={A} />
      <path d="M30 35 V85 L90 85 V35 Z" fill={W} />
      <path d="M90 35 L130 15 V65 L90 85 Z" fill={G} />
      <path d="M45 45 L75 75" strokeWidth="2.5" stroke="#ef4444" strokeDasharray="4 2" />
      <path d="M30 95 H130" strokeWidth="3" />
    </g>
  ),
  "carpet-flooring": (
    <g {...S}>
      {/* Subfloor joists and rolled vinyl / carpet flooring */}
      <rect x="30" y="65" width="100" height="24" rx="2" fill={W} />
      <path d="M30 65 L45 35 L145 35 L130 65 Z" fill={G} />
      <path d="M45 35 Q95 20 145 35" fill="none" strokeWidth="1.5" />
      <ellipse cx="40" cy="50" rx="10" ry="18" fill={A} />
      <path d="M40 32 H130 V68 H40" fill="none" strokeWidth="1.8" />
    </g>
  ),
  electrician: (
    <g {...S}>
      {/* Service panel & conduits */}
      <rect x="45" y="20" width="70" height="80" rx="4" fill={W} />
      <path d="M55 20 V10 M75 20 V8 M95 20 V10 M55 100 V112 M75 100 V114 M95 100 V112" strokeWidth="2.2" />
      <rect x="52" y="30" width="56" height="60" rx="2" fill={G} />
      <rect x="58" y="36" width="44" height="14" rx="2" fill={W} />
      <path d="M80 62 L74 72 h8 l-4 12" strokeWidth="2.4" stroke="var(--ink)" fill="none" />
      <circle cx="80" cy="43" r="2.5" fill="var(--ink)" />
    </g>
  ),
  plumber: (
    <g {...S}>
      {/* Pipe with 90 deg elbow and gate valve */}
      <path d="M20 75 H70 A20 20 0 0 0 90 55 V15" fill="none" strokeWidth="14" stroke={G} />
      <path d="M20 75 H70 A20 20 0 0 0 90 55 V15" fill="none" strokeWidth="10" stroke={W} />
      <path d="M20 75 H70 A20 20 0 0 0 90 55 V15" fill="none" strokeWidth="2" stroke="var(--ink)" />
      {/* Valve body */}
      <rect x="36" y="66" width="18" height="18" rx="2" fill={W} />
      <path d="M45 66 V52" strokeWidth="3" />
      <ellipse cx="45" cy="50" rx="14" ry="5" fill={A} />
      {/* Pressure gauge */}
      <circle cx="120" cy="45" r="16" fill={W} />
      <path d="M120 45 L128 38" strokeWidth="2" />
      <path d="M120 61 V75" strokeWidth="4" />
    </g>
  ),
  pipefitter: (
    <g {...S}>
      {/* Industrial high pressure flanged spool */}
      <path d="M25 60 H135" strokeWidth="18" stroke={G} />
      <path d="M25 60 H135" strokeWidth="14" stroke={W} />
      <path d="M25 60 H135" strokeWidth="2" stroke="var(--ink)" />
      {/* Flanges */}
      <rect x="20" y="44" width="10" height="32" rx="3" fill={G} />
      <rect x="130" y="44" width="10" height="32" rx="3" fill={G} />
      <circle cx="25" cy="50" r="1.5" fill="var(--ink)" />
      <circle cx="25" cy="70" r="1.5" fill="var(--ink)" />
      <circle cx="135" cy="50" r="1.5" fill="var(--ink)" />
      <circle cx="135" cy="70" r="1.5" fill="var(--ink)" />
      {/* Welded Tee */}
      <path d="M80 60 V22" strokeWidth="14" stroke={W} />
      <path d="M80 60 V22" strokeWidth="2" stroke="var(--ink)" />
      <rect x="68" y="16" width="24" height="8" rx="2" fill={G} />
    </g>
  ),
  ironworker: (
    <g {...S}>
      {/* Structural I-beam intersection with splice plate */}
      <path d="M80 15 V105" strokeWidth="22" stroke={G} />
      <path d="M80 15 V105" strokeWidth="18" stroke={W} />
      <path d="M80 15 V105" strokeWidth="2" stroke="var(--ink)" />
      {/* Horizontal beam */}
      <path d="M20 60 H140" strokeWidth="20" stroke={G} />
      <path d="M20 60 H140" strokeWidth="16" stroke={W} />
      <path d="M20 60 H140" strokeWidth="2" stroke="var(--ink)" />
      {/* Bolted gusset plate */}
      <rect x="66" y="46" width="28" height="28" rx="2" fill={A} />
      <circle cx="72" cy="52" r="1.8" fill="var(--ink)" />
      <circle cx="88" cy="52" r="1.8" fill="var(--ink)" />
      <circle cx="72" cy="68" r="1.8" fill="var(--ink)" />
      <circle cx="88" cy="68" r="1.8" fill="var(--ink)" />
    </g>
  ),
  "crane-operator": (
    <g {...S}>
      {/* Tower crane mast, jib & hoist cable */}
      <path d="M50 110 V25" strokeWidth="6" stroke={W} />
      <path d="M50 110 V25 M44 110 V25 M56 110 V25" strokeWidth="1.5" />
      <path d="M44 35 L56 45 M44 55 L56 65 M44 75 L56 85 M44 95 L56 105" strokeWidth="1.2" />
      {/* Jib */}
      <path d="M20 25 H145" strokeWidth="5" stroke={W} />
      <path d="M20 25 H145" strokeWidth="1.8" />
      {/* Counterweight */}
      <rect x="22" y="28" width="18" height="14" rx="2" fill={G} />
      {/* Trolley and hook */}
      <rect x="105" y="23" width="12" height="7" rx="1" fill="var(--ink)" />
      <path d="M111 30 V75" strokeWidth="1.5" strokeDasharray="3 2" />
      <path d="M107 75 h8 l-4 8 a4 4 0 0 1 -4 4 h-2" strokeWidth="2" fill="none" />
    </g>
  ),
  "heavy-equipment-operator": (
    <g {...S}>
      {/* Excavator tracked undercarriage and digging arm */}
      <rect x="30" y="80" width="70" height="24" rx="10" fill={G} />
      <circle cx="42" cy="92" r="6" fill={W} />
      <circle cx="65" cy="92" r="6" fill={W} />
      <circle cx="88" cy="92" r="6" fill={W} />
      {/* Cab */}
      <rect x="42" y="52" width="40" height="30" rx="4" fill={W} />
      <rect x="58" y="56" width="20" height="16" rx="2" fill={A} />
      {/* Boom and bucket */}
      <path d="M80 62 L112 36 L130 68" strokeWidth="6" stroke={W} />
      <path d="M80 62 L112 36 L130 68" strokeWidth="2" stroke="var(--ink)" />
      <path d="M130 68 L142 80 L132 86 L124 74 Z" fill={A} strokeWidth="2" />
    </g>
  ),
  "hvac-tech": (
    <g {...S}>
      {/* Condenser unit & fan grille */}
      <rect x="35" y="30" width="60" height="70" rx="6" fill={W} />
      <circle cx="65" cy="65" r="20" fill={G} />
      <path d="M65 48 v34 M48 65 h34 M53 53 L77 77 M77 53 L53 77" strokeWidth="1.5" />
      <circle cx="65" cy="65" r="5" fill={W} />
      {/* Duct / line set */}
      <path d="M95 50 H125 V90" strokeWidth="5" stroke={G} fill="none" />
      <path d="M95 58 H118 V90" strokeWidth="3" stroke={W} fill="none" />
      <path d="M95 50 H125 V90 M95 58 H118 V90" strokeWidth="1.5" fill="none" />
    </g>
  ),
  "sheet-metal-worker": (
    <g {...S}>
      {/* Rectangular HVAC duct with S-cleat seams */}
      <path d="M30 45 L90 25 L135 48 L75 68 Z" fill={W} />
      <path d="M30 45 V85 L75 105 V68 Z" fill={G} />
      <path d="M135 48 V88 L75 105 V68 Z" fill={W} />
      <path d="M52 38 L97 60 M52 78 L97 100" strokeWidth="1.5" strokeDasharray="4 3" />
      {/* Tin snips / seam line */}
      <path d="M75 68 V105" strokeWidth="3" stroke="var(--ink)" />
    </g>
  ),
  "elevator-mechanic": (
    <g {...S}>
      {/* Vertical hoistway T-rails and hoist cables */}
      <path d="M40 10 V110 M120 10 V110" strokeWidth="4" stroke={G} />
      <path d="M40 10 V110 M120 10 V110" strokeWidth="1.8" />
      {/* Elevator car frame */}
      <rect x="52" y="40" width="56" height="52" rx="4" fill={W} />
      <rect x="62" y="48" width="36" height="34" rx="2" fill={G} />
      {/* Cables */}
      <path d="M70 10 V40 M80 10 V40 M90 10 V40" strokeWidth="1.8" />
      <ellipse cx="80" cy="18" rx="16" ry="6" fill={A} />
    </g>
  ),
  linemen: (
    <g {...S}>
      {/* Utility pole with crossarm, insulators, transformer */}
      <path d="M80 110 V20" strokeWidth="8" stroke={W} />
      <path d="M80 110 V20" strokeWidth="2" stroke="var(--ink)" />
      {/* Crossarm */}
      <rect x="30" y="32" width="100" height="8" rx="2" fill={W} />
      {/* Insulators */}
      <rect x="38" y="24" width="8" height="8" rx="2" fill={A} />
      <rect x="76" y="24" width="8" height="8" rx="2" fill={A} />
      <rect x="114" y="24" width="8" height="8" rx="2" fill={A} />
      {/* Transformer */}
      <rect x="88" y="48" width="22" height="34" rx="5" fill={G} />
      <path d="M20 28 Q80 42 140 28" fill="none" strokeWidth="1.6" />
    </g>
  ),
  boilermaker: (
    <g {...S}>
      {/* Pressure vessel tank with dished heads */}
      <rect x="45" y="30" width="70" height="60" rx="12" fill={W} />
      <ellipse cx="45" cy="60" rx="14" ry="30" fill={G} />
      <ellipse cx="115" cy="60" rx="14" ry="30" fill={W} />
      {/* Manway / nozzle */}
      <rect x="72" y="18" width="16" height="12" rx="2" fill={G} />
      <rect x="68" y="14" width="24" height="6" rx="2" fill={A} />
      <circle cx="80" cy="60" r="10" fill={G} />
      <circle cx="80" cy="60" r="4" fill={W} />
    </g>
  ),
  painter: (
    <g {...S}>
      {/* Paint roller & tray */}
      <rect x="35" y="24" width="60" height="20" rx="5" fill={A} />
      <path d="M95 34 h15 v35 h-30 v30" fill="none" strokeWidth="3" />
      <rect x="76" y="85" width="8" height="26" rx="3" fill={W} />
      {/* Paint bucket */}
      <path d="M105 70 L110 105 h28 l5 -35 Z" fill={W} />
      <ellipse cx="126" cy="70" rx="17" ry="5" fill={G} />
      <path d="M106 72 Q126 50 146 72" fill="none" strokeWidth="1.8" />
    </g>
  ),
  "insulation-installer": (
    <g {...S}>
      {/* Stud bay with pink/yellow fiberglass batt */}
      <rect x="35" y="15" width="12" height="90" fill={W} />
      <rect x="113" y="15" width="12" height="90" fill={W} />
      <rect x="47" y="18" width="66" height="84" rx="4" fill={A} />
      <path d="M47 30 Q80 45 113 30 M47 50 Q80 65 113 50 M47 70 Q80 85 113 70 M47 90 Q80 105 113 90" fill="none" strokeWidth="1.4" strokeDasharray="3 2" />
    </g>
  ),
  pipelayer: (
    <g {...S}>
      {/* Trench box and laser-guided sewer pipe */}
      <rect x="25" y="20" width="14" height="80" fill={G} />
      <rect x="121" y="20" width="14" height="80" fill={G} />
      <path d="M39 35 H121 M39 85 H121" strokeWidth="3" />
      {/* Large bell pipe */}
      <path d="M45 76 H115" strokeWidth="16" stroke={W} />
      <path d="M45 76 H115" strokeWidth="2" stroke="var(--ink)" />
      <rect x="105" y="66" width="14" height="20" rx="3" fill={G} />
      {/* Laser line */}
      <path d="M30 65 H130" strokeWidth="1.5" stroke="#ef4444" strokeDasharray="5 3" />
    </g>
  ),
  "pile-driver": (
    <g {...S}>
      {/* Vertical driving leads & H-pile */}
      <path d="M55 10 V110 M105 10 V110" strokeWidth="3" stroke={G} />
      <path d="M55 10 V110 M105 10 V110" strokeWidth="1.5" />
      {/* Impact hammer */}
      <rect x="66" y="28" width="28" height="26" rx="3" fill={G} />
      {/* Driven H-pile */}
      <path d="M75 54 V115 M85 54 V115 M72 75 h16 M72 100 h16" strokeWidth="2.2" />
      <path d="M35 105 H125" strokeWidth="3" stroke="var(--ink)" />
    </g>
  ),
  fencer: (
    <g {...S}>
      {/* Wooden post and rail fence */}
      <rect x="28" y="25" width="12" height="85" rx="2" fill={W} />
      <rect x="120" y="25" width="12" height="85" rx="2" fill={W} />
      <rect x="74" y="25" width="12" height="85" rx="2" fill={W} />
      {/* Rails */}
      <rect x="20" y="40" width="120" height="10" rx="2" fill={G} />
      <rect x="20" y="70" width="120" height="10" rx="2" fill={G} />
      <path d="M15 105 H145" strokeWidth="2.5" />
    </g>
  ),
  "truck-driver": (
    <g {...S}>
      {/* Heavy dump truck / highway tractor */}
      <path d="M30 85 V50 a8 8 0 0 1 8 -8 h35 v43 Z" fill={W} />
      <rect x="42" y="48" width="22" height="16" rx="2" fill={A} />
      {/* Dump bed */}
      <path d="M78 85 V38 h52 v47 Z" fill={G} />
      {/* Wheels */}
      <circle cx="48" cy="90" r="10" fill={W} />
      <circle cx="48" cy="90" r="4" fill="var(--ink)" />
      <circle cx="100" cy="90" r="10" fill={W} />
      <circle cx="100" cy="90" r="4" fill="var(--ink)" />
      <circle cx="120" cy="90" r="10" fill={W} />
      <circle cx="120" cy="90" r="4" fill="var(--ink)" />
    </g>
  ),
  laborer: (
    <g {...S}>
      {/* Pneumatic jackhammer */}
      <path d="M68 25 h24 M80 25 V45" strokeWidth="4" />
      <rect x="72" y="45" width="16" height="34" rx="3" fill={W} />
      <rect x="75" y="79" width="10" height="12" rx="2" fill={G} />
      <path d="M80 91 V110" strokeWidth="5" stroke={W} />
      <path d="M80 91 V110" strokeWidth="2" stroke="var(--ink)" />
      <path d="M70 48 Q50 60 52 90" fill="none" strokeWidth="2.5" strokeDasharray="4 2" />
    </g>
  ),
  landscaper: (
    <g {...S}>
      {/* Transit level on tripod & retaining blocks */}
      <path d="M45 105 L60 52 L75 105 M60 52 V105" strokeWidth="2" />
      <rect x="46" y="44" width="28" height="8" rx="2" fill={W} />
      <circle cx="60" cy="48" r="12" fill="none" strokeWidth="1.5" />
      {/* Tiered stone blocks */}
      <rect x="90" y="75" width="24" height="14" rx="2" fill={G} />
      <rect x="114" y="75" width="24" height="14" rx="2" fill={G} />
      <rect x="102" y="61" width="24" height="14" rx="2" fill={W} />
    </g>
  ),
  millwright: (
    <g {...S}>
      {/* Shaft alignment dial indicator and motor shaft */}
      <circle cx="60" cy="65" r="24" fill={W} />
      <circle cx="60" cy="65" r="18" fill={G} />
      <circle cx="60" cy="65" r="3" fill="var(--ink)" />
      <path d="M60 65 L70 55" strokeWidth="2" />
      {/* Stem and bracket */}
      <path d="M60 41 V25 H105 V65 H125" fill="none" strokeWidth="3" />
      {/* Rotating shaft */}
      <rect x="115" y="55" width="30" height="20" rx="3" fill={W} />
    </g>
  ),
  "sign-display": (
    <g {...S}>
      {/* Structural pylon architectural sign */}
      <path d="M50 110 V25 M110 110 V25" strokeWidth="5" stroke={G} />
      <rect x="36" y="25" width="88" height="50" rx="4" fill={W} />
      <text x="80" y="56" textAnchor="middle" fontSize="16" fontWeight="800" fontFamily="sans-serif" fill="var(--ink)">
        EXIT
      </text>
    </g>
  ),
  dredger: (
    <g {...S}>
      {/* Cutterhead basket and suction boom */}
      <path d="M25 45 L95 78" strokeWidth="12" stroke={G} />
      <path d="M25 45 L95 78" strokeWidth="8" stroke={W} />
      <path d="M25 45 L95 78" strokeWidth="2" stroke="var(--ink)" />
      {/* Rotating basket */}
      <ellipse cx="108" cy="85" rx="18" ry="18" fill={A} />
      <path d="M96 75 Q108 85 120 75 M96 95 Q108 85 120 95" fill="none" strokeWidth="2.5" />
      <path d="M20 95 Q80 85 145 95" fill="none" strokeWidth="2" strokeDasharray="6 4" />
    </g>
  ),
};
