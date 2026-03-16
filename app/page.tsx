import { getSnapshotOrSample } from "@/lib/data";
import { StatCard } from "@/components/StatCard";
import { CTAChart } from "@/components/CTAChart";
import { LayoutChart } from "@/components/LayoutChart";
import { KeywordList } from "@/components/KeywordList";
import { ScrapeButton } from "@/components/ScrapeButton";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const snapshot = await getSnapshotOrSample();
  const { aggregated } = snapshot;
  const isSample = snapshot.snapshotId === "sample";

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Overview</h1>
          <p className="text-sm text-slate-dim mt-1">
            {isSample
              ? "Showing sample data. Connect Meta API to see real competitor ads."
              : `Last scraped ${new Date(snapshot.scrapedAt).toLocaleString()}`}
          </p>
        </div>
        <ScrapeButton
          endpoint="/api/scrape-all"
          label="Scrape All Competitors"
          body={{ manual: true }}
        />
      </div>

      {isSample && (
        <div className="bg-gold/10 border border-gold/30 rounded-xl p-4 text-sm text-gold">
          This is sample data. To fetch real competitor ads, add your{" "}
          <code className="bg-navy px-1.5 py-0.5 rounded text-xs">META_ACCESS_TOKEN</code>{" "}
          in Vercel environment variables.{" "}
          <a href="/setup" className="underline hover:text-gold-light">
            Setup instructions &rarr;
          </a>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Ads Analyzed"
          value={aggregated.totalAdsAnalyzed}
        />
        <StatCard
          label="Competitors Tracked"
          value={aggregated.competitors.length}
        />
        <StatCard
          label="Unique CTAs"
          value={aggregated.topCTAs.length}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CTAChart data={aggregated.topCTAs} />
        <LayoutChart data={aggregated.layoutDistribution} />
      </div>

      {/* Keywords */}
      {aggregated.headlineKeywords.length > 0 && (
        <KeywordList keywords={aggregated.headlineKeywords} />
      )}

      {/* Color palettes */}
      {aggregated.colorPalettes.some((p) => p.colors.length > 0) && (
        <div className="bg-navy rounded-xl p-5 border border-white/5">
          <h3 className="text-sm font-semibold text-white mb-4">
            Color Palettes by Competitor
          </h3>
          <div className="space-y-3">
            {aggregated.colorPalettes
              .filter((p) => p.colors.length > 0)
              .map((palette) => (
                <div key={palette.competitor} className="flex items-center gap-3">
                  <span className="text-xs text-white/60 w-28 shrink-0">
                    {palette.competitor}
                  </span>
                  <div className="flex gap-1.5">
                    {palette.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-md border border-white/10"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
