import { Figure } from "@/components/art/Figure";
import { ToolArt } from "@/components/art/Tools";
import { HwArt } from "@/components/art/Hardware";

export default function HowItWorks() {
  return (
    <section className="how" id="how">
      <h2 className="sec-title">How it works</h2>
      <ol className="how-steps">
        <li>
          <span className="how-n">1</span>
          <div className="how-art">
            <svg viewBox="0 0 220 150" width="220" height="150" aria-hidden="true">
              <path d="M30 60 L110 84 L190 60 L190 128 L110 150 L30 128 Z" fill="#fff" stroke="var(--ink)" strokeWidth="2.4" strokeLinejoin="round" />
              <path d="M110 84 V150" stroke="var(--ink)" strokeWidth="2.2" />
              <path d="M30 60 L110 38 L190 60" fill="#f2f0eb" stroke="var(--ink)" strokeWidth="2.2" strokeLinejoin="round" />
              <g transform="translate(100 98) skewY(-15)">
                <rect x="0" y="0" width="90" height="26" rx="3" fill="var(--accent)" stroke="var(--ink)" strokeWidth="2" />
                <text x="45" y="18" textAnchor="middle" fontSize="12" fontWeight="800" fill="var(--ink)" fontFamily="var(--font)">
                  2x4 WALL
                </text>
              </g>
            </svg>
            <span className="how-fig">
              <Figure pose="point" size={84} />
            </span>
          </div>
          <h3>Pick a framing assembly</h3>
          <p>Select standard assemblies like 2x4 partition walls, door and window rough openings, floor systems or corner posts.</p>
        </li>
        <li>
          <span className="how-n">2</span>
          <div className="how-art tools">
            <span style={{ transform: "rotate(-10deg)" }}>
              <ToolArt id="tape" size={82} />
            </span>
            <span style={{ transform: "translateY(-10px)" }}>
              <ToolArt id="hammer" size={88} />
            </span>
            <span style={{ transform: "rotate(8deg)" }}>
              <ToolArt id="level" size={72} />
            </span>
            <span className="how-hw">
              <HwArt kind="nail" len={30} dia={3} fit={44} />
              <b>16d</b>
            </span>
          </div>
          <h3>Review cut list and fasteners</h3>
          <p>Verify lumber dimensions, 16d and 10d nailing schedules, speed square and level layouts before assembly.</p>
        </li>
        <li>
          <span className="how-n">3</span>
          <div className="how-art step">
            <svg viewBox="0 0 200 140" width="200" height="140" aria-hidden="true">
              <path d="M30 96 L120 120 L176 96 L86 72 Z" fill="#fff" stroke="var(--ink)" strokeWidth="2.2" strokeLinejoin="round" />
              <path d="M30 96 V104 L120 128 V120 M120 128 L176 104 V96" fill="none" stroke="var(--ink)" strokeWidth="2.2" strokeLinejoin="round" />
              <g className="how-drop">
                <path d="M92 18 L104 22 L104 82 L92 78 Z" fill="var(--accent-soft)" stroke="var(--ink)" strokeWidth="2.2" strokeLinejoin="round" />
                <path d="M104 22 L150 8 L150 68 L104 82" fill="#fff" stroke="var(--ink)" strokeWidth="2.2" strokeLinejoin="round" />
                <path d="M92 18 L138 4 L150 8" fill="none" stroke="var(--ink)" strokeWidth="2.2" strokeLinejoin="round" />
              </g>
              <path d="M70 26 v26 h-7 l11 13 l11 -13 h-7 v-26 z" fill="var(--ink)" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </div>
          <h3>Follow each step in 3D</h3>
          <p>Inspect stud spacing, load-bearing header placement, diagonal squareness checks and plumb raising in 3D.</p>
        </li>
      </ol>
    </section>
  );
}
