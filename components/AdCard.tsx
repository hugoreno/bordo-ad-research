"use client";

import { useState } from "react";
import type { CompetitorAd } from "@/lib/ad-insights";

interface AdCardProps {
  ad: CompetitorAd;
}

export function AdCard({ ad }: AdCardProps) {
  const [imgError, setImgError] = useState(false);

  const card = (
    <div className="bg-navy rounded-xl border border-white/5 overflow-hidden hover:border-white/20 transition-all group cursor-pointer">
      {/* Creative image — flexible aspect ratio */}
      <div className="relative bg-navy-light overflow-hidden">
        {ad.imageUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ad.imageUrl}
            alt={ad.bodyText || "Ad creative"}
            className="w-full h-auto max-h-[400px] object-contain group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full aspect-video flex items-center justify-center text-white/20 text-sm">
            No preview available
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        {/* Page name / advertiser */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/50 font-bold shrink-0">
            {(ad.headline || ad.competitor)?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">
              {ad.headline || ad.competitor}
            </p>
            <p className="text-[11px] text-white/40">Sponsored</p>
          </div>
        </div>

        {/* Ad body text / copy */}
        {ad.bodyText && (
          <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line line-clamp-4">
            {ad.bodyText}
          </p>
        )}

        {/* CTA button */}
        {ad.cta && (
          <div className="pt-1">
            <span className="inline-flex items-center px-4 py-1.5 rounded-md text-xs font-semibold bg-white/10 text-white border border-white/10">
              {ad.cta}
            </span>
          </div>
        )}

        {/* Meta info: platform + date */}
        <div className="flex items-center justify-between text-[11px] text-white/35 pt-2 border-t border-white/5">
          <span>{ad.platform || "Facebook"}</span>
          {ad.startDate && <span>{ad.startDate}</span>}
        </div>
      </div>
    </div>
  );

  if (ad.adSnapshotUrl) {
    return (
      <a
        href={ad.adSnapshotUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {card}
      </a>
    );
  }

  return card;
}
