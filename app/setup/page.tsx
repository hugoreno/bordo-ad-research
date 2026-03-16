export default function SetupPage() {
  const hasKV = !!process.env.KV_REST_API_URL;

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Setup</h1>
        <p className="text-sm text-slate-dim mt-1">
          Configure your Ad Research Tool to persist scraped competitor data.
        </p>
      </div>

      {/* Status */}
      <div className="bg-navy rounded-xl p-5 border border-white/5 space-y-3">
        <h2 className="text-base font-semibold text-white">Status</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald" />
            <span className="text-sm text-white/80">
              Scraper: Ready (Puppeteer + headless Chrome)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full ${hasKV ? "bg-emerald" : "bg-ruby"}`} />
            <span className="text-sm text-white/80">
              Vercel KV: {hasKV ? "Connected" : "Not configured (using sample data)"}
            </span>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-navy rounded-xl p-5 border border-white/5 space-y-4">
        <h2 className="text-base font-semibold text-white">
          How It Works
        </h2>
        <p className="text-sm text-white/70">
          The tool scrapes the public{" "}
          <a
            href="https://www.facebook.com/ads/library/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:text-gold-light underline"
          >
            Meta Ad Library
          </a>{" "}
          website using a headless browser. No API key needed — the Ad Library is a
          public transparency tool.
        </p>
        <ul className="space-y-2 text-sm text-white/70 list-disc list-inside">
          <li>Searches for each competitor by name</li>
          <li>Extracts ad creatives, copy, CTAs, and platforms</li>
          <li>Runs weekly via Vercel Cron (Mondays 6 AM UTC)</li>
          <li>Stores snapshots in Vercel KV for persistence</li>
        </ul>
      </div>

      {/* Step 1: Vercel KV */}
      <div className="bg-navy rounded-xl p-5 border border-white/5 space-y-4">
        <h2 className="text-base font-semibold text-white">
          Step 1: Create a Vercel KV Store (optional)
        </h2>
        <ol className="space-y-3 text-sm text-white/70 list-decimal list-inside">
          <li>In Vercel dashboard, go to <strong className="text-white">Storage</strong></li>
          <li>Click <strong className="text-white">Create Database</strong> → <strong className="text-white">KV</strong></li>
          <li>Name it <code className="bg-navy-deep px-1.5 py-0.5 rounded text-xs text-gold">ad-research-kv</code></li>
          <li>Link it to your ad-research project — env vars are auto-populated</li>
          <li>Redeploy the app to pick up the new env vars</li>
        </ol>
        <p className="text-xs text-white/40">
          Without KV, the dashboard shows sample data. All features work, but scraped data won&apos;t persist across deployments.
        </p>
      </div>

      {/* Step 2: Cron Secret */}
      <div className="bg-navy rounded-xl p-5 border border-white/5 space-y-4">
        <h2 className="text-base font-semibold text-white">
          Step 2: Set Cron Secret (optional)
        </h2>
        <p className="text-sm text-white/70">
          Add a <code className="bg-navy-deep px-1.5 py-0.5 rounded text-xs text-gold">CRON_SECRET</code> environment
          variable in Vercel to protect the scrape-all endpoint from unauthorized calls.
        </p>
      </div>
    </div>
  );
}
