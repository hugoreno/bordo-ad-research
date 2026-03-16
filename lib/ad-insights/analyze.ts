import type { CompetitorInsights, AggregatedPatterns, LayoutPattern } from "./types";

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "it", "this", "that", "are", "was",
  "be", "has", "had", "have", "do", "does", "did", "will", "would", "can",
  "could", "should", "may", "might", "your", "you", "we", "our", "get",
  "all", "new", "now", "just", "more", "up", "out", "so", "no", "not",
]);

export function aggregatePatterns(
  allInsights: CompetitorInsights[]
): AggregatedPatterns {
  const allAds = allInsights.flatMap((i) => i.ads);
  const total = allAds.length;

  // CTA frequency
  const ctaCounts = new Map<string, number>();
  for (const ad of allAds) {
    if (ad.cta) {
      const normalized = ad.cta.toLowerCase().trim();
      ctaCounts.set(normalized, (ctaCounts.get(normalized) || 0) + 1);
    }
  }
  const topCTAs = [...ctaCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([text, count]) => ({
      text,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));

  // Headline keywords
  const wordCounts = new Map<string, number>();
  for (const ad of allAds) {
    if (ad.headline) {
      const words = ad.headline
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
      for (const word of words) {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      }
    }
  }
  const headlineKeywords = [...wordCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));

  // Layout distribution
  const layoutCounts = new Map<LayoutPattern, number>();
  for (const ad of allAds) {
    layoutCounts.set(ad.layout, (layoutCounts.get(ad.layout) || 0) + 1);
  }
  const layoutDistribution = [...layoutCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([layout, count]) => ({
      layout,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));

  // Color palettes per competitor
  const colorPalettes = allInsights.map((insight) => ({
    competitor: insight.competitor,
    colors: [
      ...new Set(insight.ads.flatMap((a) => a.dominantColors).filter(Boolean)),
    ].slice(0, 5),
  }));

  return {
    generatedAt: new Date().toISOString(),
    competitors: allInsights.map((i) => i.competitor),
    totalAdsAnalyzed: total,
    topCTAs,
    headlineKeywords,
    layoutDistribution,
    colorPalettes,
  };
}
