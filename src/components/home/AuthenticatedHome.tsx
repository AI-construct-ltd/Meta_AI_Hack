"use client";

import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import HeroStage from "@/components/home/HeroStage";
import { HeroSearch } from "@/components/home/HomeClient";
import Resume from "@/components/home/Resume";
import { Catalog } from "@/components/home/Sections";
import Compare from "@/components/home/Compare";
import HowItWorks from "./HowItWorks";
import { IArrowRight, IScan } from "@/components/art/Icons";
import { PRODUCT_COUNT } from "@/lib/search";
import { SCAN_ENABLED } from "@/lib/site";

const QUICK = [
  { slug: "wall-framing-2x4", label: "2x4 Wall Framing" },
  { slug: "foundation-mudsill-assembly", label: "Foundation Stem Wall" },
  { slug: "gable-roof-framing", label: "Gable Roof Rafters" },
  { slug: "stair-stringer-assembly", label: "Stair Framing" },
  { slug: "door-rough-opening", label: "Door Opening" },
  { slug: "window-rough-opening", label: "Window Opening" },
  { slug: "partition-tee-framing", label: "Partition Tee" },
  { slug: "shed-floor-deck", label: "8x8 Shed Floor" },
  { slug: "corner-post-framing", label: "Corner Post" },
];

export default function AuthenticatedHome() {
  return (
    <div className="site">
      <SiteHeader />

      <section className="hero">
        <div className="hero-copy">
          <h1>
            Construction & framing,
            <br />
            step by step in 3D.
          </h1>
          <p className="lead">Interactive visual training manuals for carpentry and construction apprentices. Follow every layout, stud spacing and structural connection in real time 3D.</p>

          <div className="training-notice-banner">
            <span className="training-notice-pill">Vocational Training Edition</span>
            <p>
              <strong>Notice:</strong> For apprentice training and educational assembly practice only. Not certified construction documents.
            </p>
            <p>
              <strong>Risk:</strong> Real-world structural lumber sizing, spans, and fastener schedules carry legal liability and must comply with local building codes (IRC/IBC/OSHA) and certified engineering.
            </p>
          </div>

          <HeroSearch />
          <div className="quick">
            <span>Modules</span>
            {QUICK.map((q) => (
              <Link key={q.slug} href={`/build/${q.slug}`} className="chip">
                {q.label}
              </Link>
            ))}
          </div>
          <Resume />
          {SCAN_ENABLED && (
            <Link href="/scan" className="scan-link">
              <IScan size={17} />
              <span>
                Have custom framing specs? <u>Scan its paper manual</u>
              </span>
            </Link>
          )}
        </div>
        <HeroStage />
      </section>

      <HowItWorks />

      <section className="popular" id="popular">
        <div className="sec-head">
          <h2 className="sec-title">Apprentice Training Modules</h2>
          <Link href="/trades" className="sec-link">
            All {PRODUCT_COUNT.toLocaleString("en-US")} guides <IArrowRight size={15} />
          </Link>
        </div>
        <Catalog limit={9} />
      </section>

      <Compare />

      <SiteFooter />
    </div>
  );
}
