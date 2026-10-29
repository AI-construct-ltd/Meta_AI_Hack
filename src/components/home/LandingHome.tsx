"use client";

import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import HowItWorks from "./HowItWorks";
import IkeaScrollBackground from "./IkeaScrollBackground";
import { useAuth } from "@/lib/firebase/AuthContext";
import { IArrowRight } from "../art/Icons";

export default function LandingHome() {
  const { setModalOpen } = useAuth();

  return (
    <div className="site landing-site">
      <SiteHeader />

      {/* Main hero section with animated IKEA build visuals as the background */}
      <section className="landing-hero-stage">
        <IkeaScrollBackground />

        {/* Foreground overlay */}
        <div className="landing-hero-card">
          <h1 className="landing-hero-title">
            Master the trades,
            <br />
            step by step in 3D.
          </h1>

          <p className="landing-hero-lead">
            Interactive visual training manuals for carpentry, electrical, plumbing, mechanical, and civil apprentices. Follow every layout, stud spacing, and structural connection in real time.
          </p>

          <div className="landing-hero-actions">
            <button
              type="button"
              className="landing-primary-btn"
              onClick={() => setModalOpen(true)}
            >
              <span>Sign in to start training</span>
              <IArrowRight size={16} />
            </button>
            <a href="#how" className="landing-ghost-btn">
              How it works &darr;
            </a>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <HowItWorks />

      <SiteFooter />
    </div>
  );
}
