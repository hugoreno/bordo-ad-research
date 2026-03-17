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

// Upscale Facebook thumbnail URLs to larger images
function upscaleImageUrl(url: string): string {
  if (!url) return url;
  return url.replace(/stp=dst-jpg_s\d+x\d+/, "stp=dst-jpg_s600x600");
}

interface ScrapedRawAd {
  libraryId?: string;
  pageName?: string;
  bodyText?: string;
  ctaText?: string;
  startDate?: string;
  imageUrl?: string;
  platform?: string;
}

// Known Meta UI noise lines to filter out
const NOISE_LINES = new Set([
  "Active",
  "Inactive",
  "Sponsored",
  "Ad",
  "Ads",
  "About",
  "See",
  "More",
  "Less",
  "Report",
  "Open Dropdown",
  "EU transparency",
  "See summary details",
  "See ad details",
  "See All",
  "Multiple ad versions",
  "See Summary Details",
  "Disclaimer",
  "This ad has multiple versions",
  "use this creative and text",
]);

function isNoiseLine(line: string): boolean {
  if (NOISE_LINES.has(line)) return true;
  if (line.startsWith("Library ID:")) return true;
  if (line.startsWith("Started running on")) return true;
  if (/^(Facebook|Instagram|Messenger|Audience Network)$/.test(line)) return true;
  if (line.length <= 2) return true;
  return false;
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
    await new Promise((r) => setTimeout(r, 3000));

    // Scroll to load more ads
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, 2000));
      await new Promise((r) => setTimeout(r, 2000));
    }

    const rawAds = await page.evaluate((max: number) => {
      const ads: ScrapedRawAd[] = [];

      // Find ad card containers by locating "Library ID:" text and walking up
      const allElements = document.querySelectorAll("*");
      const adRoots: Element[] = [];

      allElements.forEach((el) => {
        if (el.children.length === 0 && el.textContent?.includes("Library ID:")) {
          let container = el.parentElement;
          for (let i = 0; i < 12 && container; i++) {
            const text = container.textContent || "";
            const hasImage = container.querySelector("img") !== null;
            const hasSeeDetails = text.includes("See ad details") || text.includes("See summary details");
            const hasDate = text.includes("Started running on");
            if (hasImage && (hasSeeDetails || hasDate)) {
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

        // Use innerText and split into lines for reliable parsing
        const lines = ((container as HTMLElement).innerText || "")
          .split("\n")
          .map((l: string) => l.trim())
          .filter((l: string) => l.length > 0);

        // Extract Library ID
        const libIdLine = lines.find((l: string) => l.startsWith("Library ID:"));
        const libraryId = libIdLine?.match(/Library ID:\s*(\d+)/)?.[1];

        // Extract date
        const dateLine = lines.find((l: string) => l.startsWith("Started running on"));
        const startDate = dateLine?.replace("Started running on", "").trim();

        // Extract page name: line immediately before "Sponsored"
        let pageName: string | undefined;
        const sponsoredIdx = lines.indexOf("Sponsored");
        if (sponsoredIdx > 0) {
          pageName = lines[sponsoredIdx - 1];
        }

        // Extract ad body: text between "Sponsored" and "See ad details" / noise
        // These are the actual ad copy lines
        const bodyLines: string[] = [];
        const startIdx = sponsoredIdx >= 0 ? sponsoredIdx + 1 : 0;

        const NOISE_SET = new Set([
          "Active", "Inactive", "Sponsored", "Ad", "Ads", "About", "See",
          "More", "Less", "Report", "Open Dropdown", "EU transparency",
          "See summary details", "See ad details", "See All",
          "Multiple ad versions", "See Summary Details", "Disclaimer",
          "This ad has multiple versions", "use this creative and text",
        ]);

        for (let i = startIdx; i < lines.length; i++) {
          const line = lines[i];
          if (line.includes("See ad details") || line.includes("See summary details")) break;
          if (line.startsWith("Library ID:")) break;
          if (line.startsWith("Started running on")) break;
          if (NOISE_SET.has(line)) continue;
          if (/^(Facebook|Instagram|Messenger|Audience Network)$/.test(line)) continue;
          if (line.length <= 2) continue;
          bodyLines.push(line);
        }

        // Extract CTA from [role="button"] elements that aren't Meta UI
        const buttons = container.querySelectorAll('[role="button"], a[role="button"]');
        let ctaText: string | undefined;
        const metaButtons = new Set([
          "Open Dropdown", "See ad details", "See summary details",
          "See All", "See Summary Details", "Report", "More", "Less",
        ]);
        buttons.forEach((btn) => {
          const text = (btn.textContent || "").trim();
          if (text.length > 2 && text.length < 30 && !metaButtons.has(text) && !ctaText) {
            ctaText = text;
          }
        });

        // Extract creative image (largest, from fbcdn/scontent, not UI icons)
        const images = container.querySelectorAll("img");
        let imageUrl: string | undefined;
        images.forEach((img) => {
          const src = img.getAttribute("src") || "";
          // Skip Meta UI resource images and data URIs
          if (src.includes("rsrc.php") || src.startsWith("data:") || src.includes("safe_image")) return;
          if (src.includes("scontent") || src.includes("fbcdn")) {
            // Take the first valid ad image
            if (!imageUrl) {
              imageUrl = src;
            }
          }
        });

        // Extract platform info
        const allText = container.textContent || "";
        const platforms: string[] = [];
        if (allText.includes("Facebook")) platforms.push("Facebook");
        if (allText.includes("Instagram")) platforms.push("Instagram");
        if (allText.includes("Messenger")) platforms.push("Messenger");
        if (allText.includes("Audience Network")) platforms.push("Audience Network");

        ads.push({
          libraryId,
          pageName: pageName || undefined,
          bodyText: bodyLines.join("\n") || undefined,
          ctaText: ctaText || undefined,
          startDate: startDate || undefined,
          imageUrl: imageUrl || undefined,
          platform: platforms.length > 0 ? platforms.join(", ") : undefined,
        });
      }

      return ads;
    }, maxAds);

    return rawAds.map((raw, i) => {
      const adSnapshotUrl = raw.libraryId
        ? `https://www.facebook.com/ads/library/?id=${raw.libraryId}`
        : undefined;

      return {
        id: `${competitorName.toLowerCase().replace(/\s+/g, "-")}-${raw.libraryId || i}`,
        competitor: competitorName,
        imageUrl: upscaleImageUrl(raw.imageUrl || ""),
        headline: raw.pageName || competitorName,
        bodyText: raw.bodyText,
        cta: raw.ctaText,
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
