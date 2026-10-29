import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Catalog } from "@/components/home/Sections";
import { PRODUCT_COUNT } from "@/lib/search";
import { PRODUCTS } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Trades & 3D Visual Guides | AIConstruct",
  description: "Vocational trades directory and 2,193 interactive 3D visual apprentice guides across building, carpentry, and interior furniture assemblies.",
  alternates: { canonical: "/trades" },
};

export default function TradesPage() {
  return (
    <div className="site">
      <SiteHeader />
      <main className="browse trades-page">
        <header className="page-head">
          <span className="apprentice-tag" style={{ display: "inline-block", marginBottom: 10 }}>
            Apprentice Trades &amp; Visual Assemblies
          </span>
          <h1>Trades &amp; Visual Guides</h1>
          <p className="lead">
            {PRODUCT_COUNT.toLocaleString("en-US")} training modules and 3D visual guides in {PRODUCTS.length.toLocaleString("en-US")} configurations across construction framing, structural carpentry, and furniture &amp; interior assemblies.
          </p>
        </header>

        <Catalog search />
      </main>
      <SiteFooter />
    </div>
  );
}
