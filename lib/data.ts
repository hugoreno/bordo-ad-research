import type {
  AdResearchSnapshot,
  CompetitorInsights,
  AggregatedPatterns,
} from "@/lib/ad-insights";
import { COMPETITORS } from "@/lib/ad-insights";
import { sampleSnapshot } from "./sample-data";

let kv: { get: (key: string) => Promise<unknown>; set: (key: string, value: unknown) => Promise<unknown> } | null = null;

async function getKV() {
  if (kv) return kv;
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const mod = await import("@vercel/kv");
      kv = mod.kv;
      return kv;
    } catch {
      return null;
    }
  }
  return null;
}

export async function getSnapshot(): Promise<AdResearchSnapshot | null> {
  const store = await getKV();
  if (store) {
    const data = await store.get("snapshot:latest") as AdResearchSnapshot | null;
    if (data) return data;
  }
  return null;
}

export async function getSnapshotOrSample(): Promise<AdResearchSnapshot> {
  const snapshot = await getSnapshot();
  return snapshot ?? sampleSnapshot;
}

export async function getCompetitorInsights(
  slug: string
): Promise<CompetitorInsights | null> {
  const store = await getKV();
  if (store) {
    const data = await store.get(`competitor:${slug}`) as CompetitorInsights | null;
    if (data) return data;
  }
  // Fallback to sample data
  const competitor = COMPETITORS.find((c) => c.slug === slug);
  if (competitor) {
    const sample = sampleSnapshot.competitors.find(
      (c) => c.competitor === competitor.name
    );
    return sample ?? null;
  }
  return null;
}

export async function saveSnapshot(snapshot: AdResearchSnapshot): Promise<void> {
  const store = await getKV();
  if (!store) throw new Error("Vercel KV not configured");
  await store.set("snapshot:latest", snapshot);
  for (const comp of snapshot.competitors) {
    const config = COMPETITORS.find((c) => c.name === comp.competitor);
    if (config) {
      await store.set(`competitor:${config.slug}`, comp);
    }
  }
}
