import { z } from "zod";

export const LayoutPatternSchema = z.enum([
  "hero-image-top",
  "text-overlay",
  "split-screen",
  "character-focused",
  "jackpot-showcase",
]);

export const AdSizeSchema = z.enum(["square", "landscape", "story"]);

export const CompetitorAdSchema = z.object({
  id: z.string(),
  competitor: z.string(),
  imageUrl: z.string(),
  localImagePath: z.string().optional(),
  headline: z.string().optional(),
  bodyText: z.string().optional(),
  cta: z.string().optional(),
  dominantColors: z.array(z.string()),
  layout: LayoutPatternSchema,
  scrapedAt: z.string(),
  adSnapshotUrl: z.string().optional(),
  platform: z.string().optional(),
  startDate: z.string().optional(),
});

export const CompetitorConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  searchTerms: z.string(),
  color: z.string(),
});

export const AdResearchSnapshotSchema = z.object({
  snapshotId: z.string(),
  scrapedAt: z.string(),
  competitors: z.array(z.lazy(() => CompetitorInsightsSchema)),
  aggregated: z.lazy(() => AggregatedPatternsSchema),
});

export const CompetitorInsightsSchema = z.object({
  competitor: z.string(),
  scrapedAt: z.string(),
  ads: z.array(CompetitorAdSchema),
  totalAdsFound: z.number(),
});

export const AggregatedPatternsSchema = z.object({
  generatedAt: z.string(),
  competitors: z.array(z.string()),
  totalAdsAnalyzed: z.number(),
  topCTAs: z.array(
    z.object({ text: z.string(), count: z.number(), percentage: z.number() })
  ),
  headlineKeywords: z.array(
    z.object({ word: z.string(), count: z.number() })
  ),
  layoutDistribution: z.array(
    z.object({
      layout: LayoutPatternSchema,
      count: z.number(),
      percentage: z.number(),
    })
  ),
  colorPalettes: z.array(
    z.object({ colors: z.array(z.string()), competitor: z.string() })
  ),
});

export const CreativeBriefSchema = z.object({
  id: z.string(),
  template: z.enum(["hero-image", "text-overlay", "split-screen"]),
  size: AdSizeSchema,
  props: z.object({
    headline: z.string(),
    cta: z.string(),
    backgroundImage: z.string().optional(),
    characterImage: z.string().optional(),
    colorOverrides: z
      .object({
        background: z.string().optional(),
        headlineColor: z.string().optional(),
        ctaBackground: z.string().optional(),
        ctaColor: z.string().optional(),
      })
      .optional(),
  }),
  metadata: z
    .object({
      generatedFrom: z.string().optional(),
      sourceInsights: z.string().optional(),
    })
    .optional(),
});
