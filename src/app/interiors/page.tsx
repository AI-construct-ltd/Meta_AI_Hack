import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Catalog } from "@/components/home/Sections";

export const metadata: Metadata = {
  title: "Interiors & Furniture Guides | AIConstruct",
  description: "Explore 2,180+ interior furniture assemblies, flat pack guides, and 3D step-by-step instructions.",
  alternates: { canonical: "/interiors" },
};

export default function InteriorsPage() {
  return (
    <div className="site">
      <SiteHeader />
      <main className="browse">
        <header className="page-head">
          <span className="apprentice-tag" style={{ display: "inline-block", marginBottom: 10 }}>
            Trades &gt; Furniture &amp; Interior Craft
          </span>
          <h1>Interiors &amp; Furniture Assemblies</h1>
          <p className="lead">
            Part of the Furniture &amp; Interior trade specialization. Explore 2,180+ interior furniture models across shelving, storage cabinets, desks, tables, beds, and seating, drawn and ready to build in 3D.
          </p>
        </header>
        <Catalog search section="interiors" />
      </main>
      <SiteFooter />
    </div>
  );
}
