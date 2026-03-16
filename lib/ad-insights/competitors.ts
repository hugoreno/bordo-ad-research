import type { CompetitorConfig } from "./types";

export const COMPETITORS: CompetitorConfig[] = [
  {
    id: "club-vegas",
    name: "Club Vegas",
    slug: "club-vegas",
    searchTerms: "Club Vegas Slots",
    color: "#8B5CF6",
  },
  {
    id: "jackpot-world",
    name: "Jackpot World",
    slug: "jackpot-world",
    searchTerms: "Jackpot World Slots",
    color: "#F59E0B",
  },
  {
    id: "cashman-casino",
    name: "Cashman Casino",
    slug: "cashman-casino",
    searchTerms: "Cashman Casino Slots",
    color: "#EF4444",
  },
  {
    id: "quick-hit-slots",
    name: "Quick Hit Slots",
    slug: "quick-hit-slots",
    searchTerms: "Quick Hit Slots",
    color: "#10B981",
  },
  {
    id: "jackpot-party",
    name: "Jackpot Party",
    slug: "jackpot-party",
    searchTerms: "Jackpot Party Casino",
    color: "#3B82F6",
  },
];

export function getCompetitorBySlug(slug: string): CompetitorConfig | undefined {
  return COMPETITORS.find((c) => c.slug === slug);
}
