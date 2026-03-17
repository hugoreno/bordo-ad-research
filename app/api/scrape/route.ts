import { NextResponse } from "next/server";
import {
  scrapeCompetitorAds,
  getCompetitorBySlug,
  COMPETITORS,
  aggregatePatterns,
} from "@/lib/ad-insights";
import type { CompetitorInsights } from "@/lib/ad-insights";
import { saveSnapshot, getSnapshotOrSample } from "@/lib/data";

export const maxDuration = 60;

async function handleScrape(slug: string) {
  const config = getCompetitorBySlug(slug);
  if (!config) {
    return NextResponse.json(
      { error: `Unknown competitor: ${slug}. Valid: ${COMPETITORS.map((c) => c.slug).join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const ads = await scrapeCompetitorAds(config.searchTerms, config.name, 25);

    const insights: CompetitorInsights = {
      competitor: config.name,
      scrapedAt: new Date().toISOString(),
      ads,
      totalAdsFound: ads.length,
    };

    // Update the snapshot with this competitor's data
    const current = await getSnapshotOrSample();
    const updatedCompetitors = current.competitors.filter(
      (c) => c.competitor !== config.name
    );
    updatedCompetitors.push(insights);

    const snapshot = {
      snapshotId: `scrape-${Date.now()}`,
      scrapedAt: new Date().toISOString(),
      competitors: updatedCompetitors,
      aggregated: aggregatePatterns(updatedCompetitors),
    };

    await saveSnapshot(snapshot);

    return NextResponse.json({
      message: `Scraped ${ads.length} ads for ${config.name}`,
      insights,
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Scrape failed: ${String(err)}` },
      { status: 500 }
    );
  }
}

// POST: manual trigger from UI
export async function POST(request: Request) {
  const body = await request.json();
  return handleScrape(body.competitor as string);
}

// GET: Vercel Cron trigger via query param
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("competitor");
  if (!slug) {
    return NextResponse.json(
      { error: "Missing ?competitor= query parameter" },
      { status: 400 }
    );
  }
  return handleScrape(slug);
}
