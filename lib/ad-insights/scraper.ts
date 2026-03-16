import type { CompetitorAd, CompetitorInsights, LayoutPattern } from "./types";
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

interface ScrapedRawAd {
  bodyText?: string;
  linkTitle?: string;
  linkDescription?: string;
  pageName?: string;
  startDate?: string;
  snapshotUrl?: string;
  imageUrl?: string;
  platform?: string;
}

async function launchBrowser() {
  const chromium = (await import("@sparticuz/chromium")).default;
  const puppeteerCore = (await import("puppeteer-core")).default;

  // @sparticuz/chromium needs to decompress its bundled binary on first run
  chromium.setHeadlessMode = true;
  chromium.setGraphicsMode = false;

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

    // Wait for ad cards to render
    await page.waitForSelector('[class*="xrvj5dj"]', { timeout: 10000 }).catch(() => {
      // Fallback: try other known selectors
      return page.waitForSelector('[role="article"], [class*="ad"]', { timeout: 5000 }).catch(() => null);
    });

    // Scroll to load more ads
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollBy(0, 1000));
      await new Promise((r) => setTimeout(r, 1500));
    }

    // Extract ad data from the page
    const rawAds = await page.evaluate((max: number) => {
      const ads: ScrapedRawAd[] = [];

      // The Ad Library renders ads in container divs. We look for the ad card containers.
      // Meta's class names are obfuscated but the structure is consistent:
      // Each ad has a container with the page name, ad text, and snapshot link.
      const adContainers = document.querySelectorAll(
        '[class*="xrvj5dj"], [role="article"]'
      );

      adContainers.forEach((container) => {
        if (ads.length >= max) return;

        const allText = container.textContent || "";

        // Extract text blocks - typically body text and link titles
        const textSpans = container.querySelectorAll("span");
        let bodyText: string | undefined;
        let linkTitle: string | undefined;

        const textBlocks: string[] = [];
        textSpans.forEach((span) => {
          const t = span.textContent?.trim();
          if (t && t.length > 10 && t.length < 500) {
            textBlocks.push(t);
          }
        });

        if (textBlocks.length > 0) bodyText = textBlocks[0];
        if (textBlocks.length > 1) linkTitle = textBlocks[1];

        // Extract image
        const img = container.querySelector("img[src*='scontent'], img[src*='fbcdn']");
        const imageUrl = img?.getAttribute("src") || undefined;

        // Extract links - the "See ad details" or snapshot link
        const links = container.querySelectorAll("a[href*='ads/library']");
        let snapshotUrl: string | undefined;
        links.forEach((link) => {
          const href = link.getAttribute("href");
          if (href && href.includes("id=")) {
            snapshotUrl = href.startsWith("http") ? href : `https://www.facebook.com${href}`;
          }
        });

        // Extract date if visible
        const dateMatch = allText.match(
          /Started running on ([\w\s,]+\d{4})|(\w+ \d{1,2}, \d{4})/
        );
        const startDate = dateMatch ? dateMatch[1] || dateMatch[2] : undefined;

        // Extract platform info
        const platforms: string[] = [];
        if (allText.includes("Facebook")) platforms.push("Facebook");
        if (allText.includes("Instagram")) platforms.push("Instagram");
        if (allText.includes("Messenger")) platforms.push("Messenger");
        if (allText.includes("Audience Network")) platforms.push("Audience Network");

        if (bodyText || linkTitle || imageUrl) {
          ads.push({
            bodyText,
            linkTitle,
            linkDescription: textBlocks[2],
            startDate,
            snapshotUrl,
            imageUrl,
            platform: platforms.length > 0 ? platforms.join(", ") : undefined,
          });
        }
      });

      return ads;
    }, maxAds);

    return rawAds.map((raw, i) => {
      const allText = [raw.bodyText, raw.linkTitle, raw.linkDescription]
        .filter(Boolean)
        .join(" ");

      return {
        id: `${competitorName.toLowerCase().replace(/\s+/g, "-")}-${i}`,
        competitor: competitorName,
        imageUrl: raw.imageUrl || "",
        headline: raw.linkTitle,
        bodyText: raw.bodyText,
        cta: extractCTA(allText),
        dominantColors: [],
        layout: classifyLayout(raw.linkTitle, raw.bodyText),
        scrapedAt: new Date().toISOString(),
        adSnapshotUrl: raw.snapshotUrl,
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
