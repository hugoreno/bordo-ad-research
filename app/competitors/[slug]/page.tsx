import { notFound } from "next/navigation";
import { COMPETITORS, getCompetitorBySlug } from "@/lib/ad-insights";
import { getCompetitorInsights } from "@/lib/data";
import { StatCard } from "@/components/StatCard";
import { AdGrid } from "@/components/AdGrid";
import { ScrapeButton } from "@/components/ScrapeButton";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return COMPETITORS.map((c) => ({ slug: c.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CompetitorDetailPage({ params }: Props) {
  const { slug } = await params;
  const config = getCompetitorBySlug(slug);
  if (!config) notFound();

  const insights = await getCompetitorInsights(slug);
  if (!insights) notFound();

  const layoutCounts = new Map<string, number>();
  for (const ad of insights.ads) {
    layoutCounts.set(ad.layout, (layoutCounts.get(ad.layout) || 0) + 1);
  }
  const topLayout = [...layoutCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: config.color }}
          />
          <div>
            <h1 className="text-2xl font-bold text-white">{config.name}</h1>
            <p className="text-sm text-slate-dim mt-0.5">
              Scraped {new Date(insights.scrapedAt).toLocaleString()}
            </p>
          </div>
        </div>
        <ScrapeButton
          endpoint="/api/scrape"
          label={`Refresh ${config.name}`}
          body={{ competitor: config.slug }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Active Ads" value={insights.totalAdsFound} />
        <StatCard label="Top Layout" value={topLayout.replace(/-/g, " ")} />
        <StatCard
          label="Platforms"
          value={
            [
              ...new Set(insights.ads.map((a) => a.platform).filter(Boolean)),
            ].length || "—"
          }
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          All Ads ({insights.ads.length})
        </h2>
        <AdGrid ads={insights.ads} />
      </div>
    </div>
  );
}
