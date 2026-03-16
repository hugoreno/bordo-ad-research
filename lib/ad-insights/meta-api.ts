import type { CompetitorAd, CompetitorInsights, LayoutPattern } from "./types";
import { COMPETITORS } from "./competitors";

const META_API_BASE = "https://graph.facebook.com/v19.0";

interface MetaAdArchiveResponse {
  data: MetaAdEntry[];
  paging?: { cursors: { after: string }; next?: string };
}

interface MetaAdEntry {
  id: string;
  ad_creative_bodies?: string[];
  ad_creative_link_titles?: string[];
  ad_creative_link_captions?: string[];
  ad_creative_link_descriptions?: string[];
  ad_delivery_start_time?: string;
  ad_delivery_stop_time?: string;
  page_name?: string;
  publisher_platforms?: string[];
  ad_snapshot_url?: string;
  impressions?: { lower_bound: string; upper_bound: string };
  spend?: { lower_bound: string; upper_bound: string };
}

function classifyLayout(headline?: string, bodyText?: string): LayoutPattern {
  if (!headline && !bodyText) return "hero-image-top";
  if (headline && headline.length > 50) return "text-overlay";
  if (bodyText && bodyText.length > 100) return "text-overlay";
  return "hero-image-top";
}

function extractCTA(text?: string): string | undefined {
  if (!text) return undefined;
  const ctaPatterns = [
    /play\s*(now|free|today)/i,
    /install\s*now/i,
    /download\s*(now|free)/i,
    /get\s*(it\s*)?now/i,
    /spin\s*(now|free|&\s*win)/i,
    /claim\s*(now|your|free)/i,
    /join\s*(now|free|today)/i,
  ];
  for (const pattern of ctaPatterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return undefined;
}

function mapMetaAdToCompetitorAd(
  entry: MetaAdEntry,
  competitorName: string,
  index: number
): CompetitorAd {
  const headline = entry.ad_creative_link_titles?.[0];
  const bodyText = entry.ad_creative_bodies?.[0];
  const caption = entry.ad_creative_link_captions?.[0];
  const description = entry.ad_creative_link_descriptions?.[0];
  const allText = [headline, bodyText, caption, description].filter(Boolean).join(" ");

  return {
    id: `${competitorName.toLowerCase().replace(/\s+/g, "-")}-${entry.id || index}`,
    competitor: competitorName,
    imageUrl: entry.ad_snapshot_url || "",
    headline,
    bodyText,
    cta: extractCTA(allText) || caption,
    dominantColors: [],
    layout: classifyLayout(headline, bodyText),
    scrapedAt: new Date().toISOString(),
    adSnapshotUrl: entry.ad_snapshot_url,
    platform: entry.publisher_platforms?.join(", "),
    startDate: entry.ad_delivery_start_time,
  };
}

export async function fetchCompetitorAds(
  searchTerms: string,
  competitorName: string,
  accessToken: string,
  maxAds = 25
): Promise<CompetitorAd[]> {
  const params = new URLSearchParams({
    search_terms: searchTerms,
    ad_reached_countries: "US",
    ad_active_status: "ACTIVE",
    ad_type: "ALL",
    fields: [
      "id",
      "ad_creative_bodies",
      "ad_creative_link_titles",
      "ad_creative_link_captions",
      "ad_creative_link_descriptions",
      "ad_delivery_start_time",
      "ad_delivery_stop_time",
      "page_name",
      "publisher_platforms",
      "ad_snapshot_url",
    ].join(","),
    access_token: accessToken,
    limit: String(Math.min(maxAds, 25)),
  });

  const url = `${META_API_BASE}/ads_archive?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Meta Ad Library API error (${response.status}): ${error}`);
  }

  const data: MetaAdArchiveResponse = await response.json();
  return data.data.map((entry, i) => mapMetaAdToCompetitorAd(entry, competitorName, i));
}

export async function fetchAllCompetitors(
  accessToken: string,
  maxAdsPerCompetitor = 25
): Promise<CompetitorInsights[]> {
  const results: CompetitorInsights[] = [];

  for (const competitor of COMPETITORS) {
    try {
      const ads = await fetchCompetitorAds(
        competitor.searchTerms,
        competitor.name,
        accessToken,
        maxAdsPerCompetitor
      );
      results.push({
        competitor: competitor.name,
        scrapedAt: new Date().toISOString(),
        ads,
        totalAdsFound: ads.length,
      });
    } catch (err) {
      console.error(`Failed to fetch ads for ${competitor.name}:`, err);
      results.push({
        competitor: competitor.name,
        scrapedAt: new Date().toISOString(),
        ads: [],
        totalAdsFound: 0,
      });
    }
  }

  return results;
}
