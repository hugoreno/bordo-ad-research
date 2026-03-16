import type {
  AdResearchSnapshot,
  CompetitorAd,
  CompetitorInsights,
} from "@/lib/ad-insights";
import { aggregatePatterns } from "@/lib/ad-insights";

function makeAd(
  competitor: string,
  index: number,
  overrides: Partial<CompetitorAd> = {}
): CompetitorAd {
  const slug = competitor.toLowerCase().replace(/\s+/g, "-");
  return {
    id: `${slug}-sample-${index}`,
    competitor,
    imageUrl: "",
    headline: overrides.headline ?? `Win Big with ${competitor}!`,
    bodyText: overrides.bodyText ?? "Spin the reels and collect amazing rewards every day.",
    cta: overrides.cta ?? "Play Now",
    dominantColors: overrides.dominantColors ?? ["#FFD700", "#8B0000", "#1a1a2e"],
    layout: overrides.layout ?? "hero-image-top",
    scrapedAt: "2026-03-16T12:00:00.000Z",
    platform: overrides.platform ?? "Facebook, Instagram",
    startDate: overrides.startDate ?? "2026-03-01",
    ...overrides,
  };
}

function makeCompetitorInsights(
  name: string,
  ads: Partial<CompetitorAd>[]
): CompetitorInsights {
  return {
    competitor: name,
    scrapedAt: "2026-03-16T12:00:00.000Z",
    ads: ads.map((a, i) => makeAd(name, i, a)),
    totalAdsFound: ads.length,
  };
}

const clubVegas = makeCompetitorInsights("Club Vegas", [
  { headline: "Mega Jackpot Awaits!", cta: "Play Now", layout: "hero-image-top", dominantColors: ["#8B5CF6", "#FFD700", "#1a1a2e"] },
  { headline: "Free Coins Every Hour — Collect Yours", cta: "Claim Now", layout: "text-overlay", dominantColors: ["#8B5CF6", "#FF6B6B", "#1a1a2e"] },
  { headline: "VIP Rewards Unlocked", cta: "Spin Free", layout: "hero-image-top", dominantColors: ["#8B5CF6", "#C0C0C0", "#FFD700"] },
  { headline: "500+ Slot Machines", bodyText: "Experience the thrill of Vegas right on your phone with our massive collection of slot games.", cta: "Install Now", layout: "text-overlay", dominantColors: ["#8B5CF6", "#1a1a2e", "#FFD700"] },
  { headline: "Daily Bonus Spins", cta: "Play Free", layout: "hero-image-top", dominantColors: ["#8B5CF6", "#FF4500", "#FFD700"] },
  { headline: "Join Millions of Players", cta: "Play Now", layout: "split-screen", dominantColors: ["#8B5CF6", "#00CED1", "#FFD700"] },
]);

const jackpotWorld = makeCompetitorInsights("Jackpot World", [
  { headline: "Biggest Jackpots in Mobile Gaming!", cta: "Spin Now", layout: "hero-image-top", dominantColors: ["#F59E0B", "#DC2626", "#1a1a2e"] },
  { headline: "Win Real-Feel Rewards", cta: "Play Free", layout: "text-overlay", dominantColors: ["#F59E0B", "#7C3AED", "#1a1a2e"] },
  { headline: "New Slots Every Week", cta: "Download Now", layout: "hero-image-top", dominantColors: ["#F59E0B", "#10B981", "#1a1a2e"] },
  { headline: "Fortune Favors the Bold", bodyText: "Spin your way to massive jackpots with our premium slot experience.", cta: "Play Now", layout: "character-focused", dominantColors: ["#F59E0B", "#FFD700", "#8B0000"] },
  { headline: "Free Spins Bonanza", cta: "Claim Now", layout: "jackpot-showcase", dominantColors: ["#F59E0B", "#FF6B6B", "#FFD700"] },
]);

const cashmanCasino = makeCompetitorInsights("Cashman Casino", [
  { headline: "Mr. Cashman Has Gifts!", cta: "Play Now", layout: "character-focused", dominantColors: ["#EF4444", "#FFD700", "#1a1a2e"] },
  { headline: "Collect Free Coins Daily", cta: "Claim Free", layout: "hero-image-top", dominantColors: ["#EF4444", "#C0C0C0", "#1a1a2e"] },
  { headline: "Over 200 Premium Slots", bodyText: "The most authentic casino experience on mobile with Mr. Cashman by your side.", cta: "Install Now", layout: "text-overlay", dominantColors: ["#EF4444", "#FFD700", "#7C3AED"] },
  { headline: "Lucky Streak Bonus", cta: "Spin Free", layout: "jackpot-showcase", dominantColors: ["#EF4444", "#00FF7F", "#FFD700"] },
  { headline: "VIP Tables Open Now", cta: "Join Free", layout: "split-screen", dominantColors: ["#EF4444", "#1a1a2e", "#C0C0C0"] },
  { headline: "Mega Win Alert", cta: "Play Now", layout: "hero-image-top", dominantColors: ["#EF4444", "#FFD700", "#FF6B6B"] },
  { headline: "Double Rewards Weekend", cta: "Play Free", layout: "text-overlay", dominantColors: ["#EF4444", "#8B5CF6", "#FFD700"] },
]);

const quickHitSlots = makeCompetitorInsights("Quick Hit Slots", [
  { headline: "Quick Hit Fever!", cta: "Play Now", layout: "hero-image-top", dominantColors: ["#10B981", "#FFD700", "#1a1a2e"] },
  { headline: "Classic Vegas Slots", cta: "Spin Free", layout: "hero-image-top", dominantColors: ["#10B981", "#DC2626", "#1a1a2e"] },
  { headline: "Hit it Rich with Free Spins", bodyText: "Get the authentic Quick Hit experience with daily free spins and bonuses.", cta: "Download Now", layout: "text-overlay", dominantColors: ["#10B981", "#FFD700", "#7C3AED"] },
  { headline: "Platinum Rewards", cta: "Claim Now", layout: "split-screen", dominantColors: ["#10B981", "#C0C0C0", "#FFD700"] },
]);

const jackpotParty = makeCompetitorInsights("Jackpot Party", [
  { headline: "Party Never Stops!", cta: "Play Free", layout: "hero-image-top", dominantColors: ["#3B82F6", "#FF69B4", "#FFD700"] },
  { headline: "Exclusive Slot Collection", bodyText: "Join the party with hundreds of unique slot games and daily challenges.", cta: "Install Now", layout: "text-overlay", dominantColors: ["#3B82F6", "#FFD700", "#1a1a2e"] },
  { headline: "Free Coins Giveaway", cta: "Claim Now", layout: "hero-image-top", dominantColors: ["#3B82F6", "#FF6B6B", "#FFD700"] },
  { headline: "VIP Party Access", cta: "Join Now", layout: "character-focused", dominantColors: ["#3B82F6", "#8B5CF6", "#FFD700"] },
  { headline: "Spin & Win Extravaganza", cta: "Spin Now", layout: "jackpot-showcase", dominantColors: ["#3B82F6", "#FFD700", "#00CED1"] },
]);

const allInsights = [clubVegas, jackpotWorld, cashmanCasino, quickHitSlots, jackpotParty];

export const sampleSnapshot: AdResearchSnapshot = {
  snapshotId: "sample",
  scrapedAt: "2026-03-16T12:00:00.000Z",
  competitors: allInsights,
  aggregated: aggregatePatterns(allInsights),
};
