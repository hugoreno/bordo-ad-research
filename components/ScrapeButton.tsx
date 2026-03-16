"use client";

import { useState } from "react";

interface ScrapeButtonProps {
  endpoint: string;
  label: string;
  body?: Record<string, unknown>;
}

export function ScrapeButton({ endpoint, label, body }: ScrapeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleScrape() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ ok: true, message: data.message || "Scrape complete!" });
      } else {
        setResult({ ok: false, message: data.error || `Error ${res.status}` });
      }
    } catch (err) {
      setResult({ ok: false, message: String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-3">
      <button
        onClick={handleScrape}
        disabled={loading}
        className="px-4 py-2 rounded-lg text-sm font-medium bg-gold text-navy hover:bg-gold-light disabled:opacity-50 disabled:cursor-wait transition-colors"
      >
        {loading ? "Scraping..." : label}
      </button>
      {result && (
        <span
          className={`text-xs ${result.ok ? "text-emerald" : "text-ruby"}`}
        >
          {result.message}
        </span>
      )}
    </div>
  );
}
