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

      // The Ad Library page contains "Library ID:" text for each ad.
      // We find these markers and walk up to get the containing card.
      // Each ad card contains: Library ID, started running date, image, body text, platforms.

      // Strategy: find all elements containing "Library ID:" and use their
      // ancestor container as the ad boundary.
      const allElements = document.querySelectorAll("*");
      const adRoots: Element[] = [];

      // Find distinct ad containers by looking for "Library ID:" text
      allElements.forEach((el) => {
        if (el.children.length === 0 && el.textContent?.includes("Library ID:")) {
          // Walk up to find a meaningful container (usually 5-8 levels up)
          let container = el.parentElement;
          for (let i = 0; i < 8 && container; i++) {
            // Check if this container has both text content and an image
            const hasImage = container.querySelector("img") !== null;
            const hasDate = container.textContent?.includes("Started running on") ?? false;
            if (hasImage && hasDate) {
              // Make sure we haven't already captured this container
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

        // Extract all meaningful text blocks (body text, headlines)
        const textBlocks: string[] = [];
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
        let node: Node | null;
        while ((node = walker.nextNode())) {
          const t = (node.textContent || "").trim();
          // Filter out noise: dates, Library IDs, platform names, short labels
          if (
            t.length > 15 &&
            t.length < 500 &&
            !t.includes("Library ID:") &&
            !t.includes("Started running on") &&
            !t.includes("See ad details") &&
            !t.match(/^(Facebook|Instagram|Messenger|Audience Network|Active|Inactive)$/)
          ) {
            // Avoid duplicates
            if (!textBlocks.some((b) => b.includes(t) || t.includes(b))) {
              textBlocks.push(t);
            }
          }
        }

        // Extract images
        const images = container.querySelectorAll("img");
        let imageUrl: string | undefined;
        images.forEach((img) => {
          const src = img.getAttribute("src") || "";
          if ((src.includes("scontent") || src.includes("fbcdn")) && !imageUrl) {
            imageUrl = src;
          }
        });

        // Extract snapshot/detail link
        const links = container.querySelectorAll("a");
        let snapshotUrl: string | undefined;
        links.forEach((link) => {
          const href = link.getAttribute("href") || "";
          if (href.includes("ads/library") && href.includes("id=")) {
            snapshotUrl = href.startsWith("http") ? href : `https://www.facebook.com${href}`;
          }
        });

        // Extract platform info
        const platforms: string[] = [];
        if (allText.includes("Facebook")) platforms.push("Facebook");
        if (allText.includes("Instagram")) platforms.push("Instagram");
        if (allText.includes("Messenger")) platforms.push("Messenger");
        if (allText.includes("Audience Network")) platforms.push("Audience Network");

        const bodyText = textBlocks[0];
        const linkTitle = textBlocks.length > 1 ? textBlocks[1] : undefined;

        ads.push({
          bodyText,
          linkTitle,
          linkDescription: textBlocks.length > 2 ? textBlocks[2] : undefined,
          pageName: undefined,
          startDate,
          snapshotUrl,
          imageUrl,
          platform: platforms.length > 0 ? platforms.join(", ") : undefined,
        });
      }

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
