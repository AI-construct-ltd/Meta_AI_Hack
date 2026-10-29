"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { CONSTRUCTION_TRADES, type Trade } from "@/data/construction-trades";
import { catalogEntry, toSpec } from "@/lib/catalog";
import { buildPlan } from "@/lib/plan";
import Thumb from "../Thumb";
import { TradeArt } from "../art/TradeArt";
import { IArrowRight, IBox, ICheck, ISearch } from "../art/Icons";

const CATEGORIES = [
  { id: "all", label: "All Trades" },
  { id: "Structural & Framing", label: "Structural & Framing" },
  { id: "Mechanical & Systems", label: "Mechanical & Systems" },
  { id: "Finishing", label: "Finishing" },
  { id: "Furniture & Interior", label: "Furniture & Interior" },
  { id: "Civil & Heavy", label: "Civil & Heavy" },
  { id: "Specialty", label: "Specialty" },
] as const;

export default function TradesDirectory() {
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CONSTRUCTION_TRADES.filter((t) => {
      const matchCat = filter === "all" || t.category === filter;
      if (!matchCat) return false;
      if (!q) return true;
      const haystack = `${t.name} ${t.category} ${t.description} ${t.skills.join(" ")}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [filter, query]);

  return (
    <div className="trades-catalog" id="trades">
      <div className="cat-bar">
        <div className="cat-tabs" role="tablist">
          {CATEGORIES.map((c) => {
            const count = c.id === "all" ? CONSTRUCTION_TRADES.length : CONSTRUCTION_TRADES.filter((t) => t.category === c.id).length;
            const on = filter === c.id;
            return (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setFilter(c.id)}
                className={"cat-tab" + (on ? " on" : "")}
              >
                <span>{c.label}</span>
                <span className="cat-n">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="trades-search-wrap">
          <ISearch size={15} className="trades-search-ico" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search trades or skills..."
            className="trades-search-field"
            aria-label="Search trades"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="trades-clear-btn" aria-label="Clear">
              &times;
            </button>
          )}
        </div>
      </div>

      <div className="pgrid">
        {filtered.map((trade, i) => (
          <TradeCardItem key={trade.id} trade={trade} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="trades-empty-box">
          <p>No trades matching &ldquo;{query}&rdquo;.</p>
          <button type="button" onClick={() => { setQuery(""); setFilter("all"); }} className="btn btn-subtle">
            Reset filter
          </button>
        </div>
      )}
    </div>
  );
}

function TradeCardItem({ trade, index }: { trade: Trade; index: number }) {
  const entry = trade.moduleSlug ? catalogEntry(trade.moduleSlug) : null;
  const href = trade.linkHref ? trade.linkHref : trade.moduleSlug ? `/build/${trade.moduleSlug}` : `#${trade.id}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, delay: Math.min(0.25, (index % 12) * 0.025), ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={href} className="pcard trade-pcard">
        <span className="pcard-art trade-art-box">
          {entry ? (
            <Thumb
              id={`trade-${trade.id}-${trade.moduleSlug}`}
              plan={() => buildPlan(toSpec(entry))}
              mode={{ kind: "assembled" }}
              w={360}
              h={240}
              className="pcard-thumb"
              alt={`${trade.name} 3D model`}
              lazy={index >= 6}
            />
          ) : (
            <div className="trade-vector-wrap">
              <TradeArt tradeId={trade.id} size={96} />
            </div>
          )}
        </span>

        <span className="pcard-text">
          <span className="pcard-top">
            <b>{trade.name}</b>
            <span className="pcard-go">
              <IArrowRight size={17} />
            </span>
          </span>

          <span className="pcard-variant">{trade.skills.slice(0, 3).join(" · ")}</span>

          <span className="pcard-meta">
            <span className="trade-badge-cat">{trade.category}</span>
            {trade.linkHref ? (
              <span className="trade-badge-guide">
                <IBox size={13} /> 2,180+ Guides
              </span>
            ) : trade.moduleSlug ? (
              <span className="trade-badge-guide">
                <IBox size={13} /> 3D Guide
              </span>
            ) : (
              <span className="trade-badge-voc">
                <ICheck size={13} strokeWidth={2.5} /> Trade Skill
              </span>
            )}
          </span>
        </span>
      </Link>
    </motion.div>
  );
}
