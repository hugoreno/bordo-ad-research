import { COMPETITORS } from "@/lib/ad-insights";
import { getSnapshotOrSample } from "@/lib/data";
import { CompetitorCard } from "@/components/CompetitorCard";

export const dynamic = "force-dynamic";

export default async function CompetitorsPage() {
  const snapshot = await getSnapshotOrSample();

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Competitors</h1>
        <p className="text-sm text-slate-dim mt-1">
          {snapshot.competitors.reduce((sum, c) => sum + c.totalAdsFound, 0)} total
          ads across {COMPETITORS.length} competitors
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {COMPETITORS.map((config) => {
          const insights = snapshot.competitors.find(
            (c) => c.competitor === config.name
          );
          if (!insights) return null;
          return (
            <CompetitorCard
              key={config.slug}
              config={config}
              insights={insights}
            />
          );
        })}
      </div>
    </div>
  );
}
