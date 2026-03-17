"use client";

import type { CompetitorAd } from "@/lib/ad-insights";
import { AdCard } from "./AdCard";

interface AdGridProps {
  ads: CompetitorAd[];
}

export function AdGrid({ ads }: AdGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {ads.map((ad) => (
        <AdCard key={ad.id} ad={ad} />
      ))}
      {ads.length === 0 && (
        <p className="col-span-full text-center text-white/40 py-12">
          No ads found.
        </p>
      )}
    </div>
  );
}
