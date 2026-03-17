import type { CompetitorAd, CompetitorInsights } from "./types";
import { COMPETITORS } from "./competitors";

const AD_LIBRARY_BASE = "https://www.facebook.com/ads/library/";

function buildSearchUrl(searchTerms: string): string {
  const params = new URLSearchParams({
    active_status: "active",
    ad_type: "all",
    country: "US",
    media_type: "all",
    q: searchTerms,
  });
  return `${AD_LIBRARY_BASE}?${params.toString()}`;
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
    /sign\s*up/i,
    /learn\s*more/i,
    /shop\s*now/i,
    /try\s*(now|free|it)/i,
  ];
  for (const pattern of ctaPatterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return undefined;
}

// Upscale Facebook thumbnail URLs to larger images
function upscaleImageUrl(url: string): string {
  if (!url) return url;
  // Replace small thumbnail size params with larger ones
  // s60x60 -> s600x600, s100x100 -> s600x600, etc.
  return url.replace(/stp=dst-jpg_s\d+x\d+/, "stp=dst-jpg_s600x600");
}

interface ScrapedRawAd {
  libraryId?: string;
  bodyText?: string;
  linkTitle?: string;
  startDate?: string;
  imageUrl?: string;
  platform?: string;
}

async function launchBrowser() {
  const chromium = (await import("@sparticuz/chromium")).default;
  const puppeteerCore = (await import("puppeteer-core")).default;

  const browser = await puppeteerCore.launch({
    args: chromium.args,
    defaultViewport: { width: 1280, height: 900 },
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  return browser;
}

export async function scrapeCompetitorAds(
  searchTerms: string,
  competitorName: string,
  maxAds = 25
): Promise<CompetitorAd[]> {
  const url = buildSearchUrl(searchTerms);
  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    await page.goto(url, { waitUntil: "networkidle2", timeout: 25000 });

    // Wait for the page to have ad content loaded
    await new Promise((r) => setTimeout(r, 3000));

    // Scroll to load more ads
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, 2000));
      await new Promise((r) => setTimeout(r, 2000));
    }

    // Extract ad data from the page
    const rawAds = await page.evaluate((max: number) => {
      const ads: ScrapedRawAd[] = [];

      // Find all "Library ID:" text nodes to locate ad cards
      const allElements = document.querySelectorAll("*");
      const adRoots: Element[] = [];

      allElements.forEach((el) => {
        if (el.children.length === 0 && el.textContent?.includes("Library ID:")) {
          let container = el.parentElement;
          for (let i = 0; i < 10 && container; i++) {
            const hasImage = container.querySelector("img") !== null;
            const hasDate = container.textContent?.includes("Started running on") ?? false;
            if (hasImage && hasDate) {
              if (!adRoots.some((r) => r === container || r.contains(container!) || container!.contains(r))) {
                adRoots.push(container);
              }
              break;
            }
            container = container.parentElement;
          }
        }
      });

      for (const container of adRoots) {
        if (ads.length >= max) break;

        const allText = container.textContent || "";

        // Extract Library ID
        const libIdMatch = allText.match(/Library ID:\s*(\d+)/);
        const libraryId = libIdMatch ? libIdMatch[1] : undefined;

        // Extract date
        const dateMatch = allText.match(/Started running on\s+([\w\s,]+?\d{4})/);
        const startDate = dateMatch ? dateMatch[1].trim() : undefined;

        // Extract meaningful text blocks, filtering out Meta UI noise
        const noisePatterns = [
          /Library ID:/,
          /Started running on/,
          /See ad details/,
          /This ad has multiple versions/,
          /use this creative and text/,
          /^(Facebook|Instagram|Messenger|Audience Network|Active|Inactive)$/,
          /^(Ad|Ads|About|See|More|Less|Report)$/,
          /Multiple ad versions/,
          /See Summary Details/,
        ];

        const textBlocks: string[] = [];
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
        let node: Node | null;
        while ((node = walker.nextNode())) {
          const t = (node.textContent || "").trim();
          if (t.length > 10 && t.length < 500) {
            const isNoise = noisePatterns.some((p) => p.test(t));
            if (!isNoise && !textBlocks.some((b) => b.includes(t) || t.includes(b))) {
              textBlocks.push(t);
            }
          }
        }

        // Extract the best image (largest one, not tiny icons)
        const images = container.querySelectorAll("img");
        let imageUrl: string | undefined;
        let bestSize = 0;
        images.forEach((img) => {
          const src = img.getAttribute("src") || "";
          if (src.includes("scontent") || src.includes("fbcdn")) {
            // Prefer images that appear larger in the DOM
            const w = img.naturalWidth || img.width || 0;
            const h = img.naturalHeight || img.height || 0;
            const size = w * h;
            if (!imageUrl || size > bestSize) {
              imageUrl = src;
              bestSize = size;
            }
          }
        });

        // Extract platform info
        const platforms: string[] = [];
        if (allText.includes("Facebook")) platforms.push("Facebook");
        if (allText.includes("Instagram")) platforms.push("Instagram");
        if (allText.includes("Messenger")) platforms.push("Messenger");
        if (allText.includes("Audience Network")) platforms.push("Audience Network");

        ads.push({
          libraryId,
          bodyText: textBlocks[0],
          linkTitle: textBlocks.length > 1 ? textBlocks[1] : undefined,
          startDate,
          imageUrl,
          platform: platforms.length > 0 ? platforms.join(", ") : undefined,
        });
      }

      return ads;
    }, maxAds);

    return rawAds.map((raw, i) => {
      const allText = [raw.bodyText, raw.linkTitle].filter(Boolean).join(" ");

      // Build snapshot URL from Library ID
      const adSnapshotUrl = raw.libraryId
        ? `https://www.facebook.com/ads/library/?id=${raw.libraryId}`
        : undefined;

      return {
        id: `${competitorName.toLowerCase().replace(/\s+/g, "-")}-${raw.libraryId || i}`,
        competitor: competitorName,
        imageUrl: upscaleImageUrl(raw.imageUrl || ""),
        headline: raw.bodyText,
        bodyText: raw.linkTitle,
        cta: extractCTA(allText),
        dominantColors: [],
        layout: "hero-image-top" as const,
        scrapedAt: new Date().toISOString(),
        adSnapshotUrl,
        platform: raw.platform,
        startDate: raw.startDate,
      };
    });
  } finally {
    await browser.close();
  }
}

export async function scrapeAllCompetitors(
  maxAdsPerCompetitor = 25
): Promise<CompetitorInsights[]> {
  const results: CompetitorInsights[] = [];

  for (const competitor of COMPETITORS) {
    try {
      const ads = await scrapeCompetitorAds(
        competitor.searchTerms,
        competitor.name,
        maxAdsPerCompetitor
      );
      results.push({
        competitor: competitor.name,
        scrapedAt: new Date().toISOString(),
        ads,
        totalAdsFound: ads.length,
      });
    } catch (err) {
      console.error(`Failed to scrape ads for ${competitor.name}:`, err);
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
