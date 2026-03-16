import { NextResponse } from "next/server";
import { fetchAllCompetitors, aggregatePatterns } from "@/lib/ad-insights";
import { saveSnapshot } from "@/lib/data";

export const maxDuration = 30;

export async function POST(request: Request) {
  // Verify cron secret if called from Vercel Cron
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Allow calls without auth if no cron secret set (manual trigger from UI)
    const body = await request.json().catch(() => ({}));
    if (!body.manual) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const accessToken = process.env.META_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json(
      { error: "META_ACCESS_TOKEN not configured. Go to /setup for instructions." },
      { status: 400 }
    );
  }

  try {
    const allInsights = await fetchAllCompetitors(accessToken, 25);
    const aggregated = aggregatePatterns(allInsights);

    const snapshot = {
      snapshotId: `scrape-all-${Date.now()}`,
      scrapedAt: new Date().toISOString(),
      competitors: allInsights,
      aggregated,
    };

    await saveSnapshot(snapshot);

    const totalAds = allInsights.reduce((sum, c) => sum + c.totalAdsFound, 0);

    return NextResponse.json({
      message: `Scraped ${totalAds} ads across ${allInsights.length} competitors`,
      summary: {
        totalAds,
        competitors: allInsights.map((c) => ({
          name: c.competitor,
          ads: c.totalAdsFound,
        })),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Scrape failed: ${String(err)}` },
      { status: 500 }
    );
  }
}

// Also support GET for Vercel Cron
export async function GET(request: Request) {
  return POST(request);
}
