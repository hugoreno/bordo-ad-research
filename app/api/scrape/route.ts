import { NextResponse } from "next/server";
import {
  fetchCompetitorAds,
  getCompetitorBySlug,
  COMPETITORS,
  aggregatePatterns,
} from "@/lib/ad-insights";
import type { CompetitorInsights } from "@/lib/ad-insights";
import { saveSnapshot, getSnapshotOrSample } from "@/lib/data";

export async function POST(request: Request) {
  const accessToken = process.env.META_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json(
      { error: "META_ACCESS_TOKEN not configured. Go to /setup for instructions." },
      { status: 400 }
    );
  }

  const body = await request.json();
  const slug = body.competitor as string;

  const config = getCompetitorBySlug(slug);
  if (!config) {
    return NextResponse.json(
      { error: `Unknown competitor: ${slug}. Valid: ${COMPETITORS.map((c) => c.slug).join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const ads = await fetchCompetitorAds(
      config.searchTerms,
      config.name,
      accessToken,
      25
    );

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
