import Link from "next/link";
import type { CompetitorInsights, CompetitorConfig } from "@/lib/ad-insights";

interface CompetitorCardProps {
  insights: CompetitorInsights;
  config: CompetitorConfig;
}

export function CompetitorCard({ insights, config }: CompetitorCardProps) {
  const topCtas = new Map<string, number>();
  for (const ad of insights.ads) {
    if (ad.cta) {
      const normalized = ad.cta.toLowerCase();
      topCtas.set(normalized, (topCtas.get(normalized) || 0) + 1);
    }
  }
  const topCta = [...topCtas.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <Link
      href={`/competitors/${config.slug}`}
      className="block bg-navy rounded-xl border border-white/5 overflow-hidden hover:border-white/15 transition-colors"
    >
      {/* Color header */}
      <div
        className="h-2"
        style={{ backgroundColor: config.color }}
      />

      <div className="p-5 space-y-3">
        <div className="flex items-center gap-3">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: config.color }}
          />
          <h3 className="text-base font-semibold text-white">{config.name}</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-2xl font-bold text-white">{insights.totalAdsFound}</p>
            <p className="text-xs text-slate-dim">Active Ads</p>
          </div>
          <div>
            <p className="text-sm font-medium text-white/80">
              {topCta || "—"}
            </p>
            <p className="text-xs text-slate-dim">Top CTA</p>
          </div>
        </div>

        {/* Color palette preview */}
        <div className="flex gap-1">
          {[...new Set(insights.ads.flatMap((a) => a.dominantColors))]
            .slice(0, 6)
            .map((color, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-md"
                style={{ backgroundColor: color }}
              />
            ))}
        </div>

        <p className="text-xs text-white/40">
          Scraped {new Date(insights.scrapedAt).toLocaleDateString()}
        </p>
      </div>
    </Link>
  );
}
