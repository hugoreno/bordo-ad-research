import { getSnapshotOrSample } from "@/lib/data";
import { StatCard } from "@/components/StatCard";
import { CTAChart } from "@/components/CTAChart";
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
              ? "Showing sample data. Scrape competitors to see real ads."
              : `Last scraped ${new Date(snapshot.scrapedAt).toLocaleString()}`}
          </p>
        </div>
        <ScrapeButton
          endpoint="/api/scrape-all"
          label="Scrape All Competitors"
          body={{ manual: true }}
        />
      </div>

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

      {/* CTA Chart */}
      {aggregated.topCTAs.length > 0 && (
        <CTAChart data={aggregated.topCTAs} />
      )}

      {/* Keywords */}
      {aggregated.headlineKeywords.length > 0 && (
        <KeywordList keywords={aggregated.headlineKeywords} />
      )}
    </div>
  );
}
