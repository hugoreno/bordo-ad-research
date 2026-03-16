"use client";

import { useState } from "react";
import type { CompetitorAd, LayoutPattern } from "@/lib/ad-insights";
import { AdCard } from "./AdCard";

interface AdGridProps {
  ads: CompetitorAd[];
}

const LAYOUTS: { value: LayoutPattern | "all"; label: string }[] = [
  { value: "all", label: "All Layouts" },
  { value: "hero-image-top", label: "Hero Image" },
  { value: "text-overlay", label: "Text Overlay" },
  { value: "split-screen", label: "Split Screen" },
  { value: "character-focused", label: "Character" },
  { value: "jackpot-showcase", label: "Jackpot" },
];

export function AdGrid({ ads }: AdGridProps) {
  const [filter, setFilter] = useState<LayoutPattern | "all">("all");

  const filtered = filter === "all" ? ads : ads.filter((a) => a.layout === filter);

  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {LAYOUTS.map((l) => (
          <button
            key={l.value}
            onClick={() => setFilter(l.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === l.value
                ? "bg-gold text-navy"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ad) => (
          <AdCard key={ad.id} ad={ad} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-center text-white/40 py-12">No ads match this filter.</p>
      )}
    </div>
  );
}
