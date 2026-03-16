export default function SetupPage() {
  const hasToken = !!process.env.META_ACCESS_TOKEN;
  const hasKV = !!process.env.KV_REST_API_URL;

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Setup</h1>
        <p className="text-sm text-slate-dim mt-1">
          Configure your Ad Research Tool to fetch real competitor data.
        </p>
      </div>

      {/* Status */}
      <div className="bg-navy rounded-xl p-5 border border-white/5 space-y-3">
        <h2 className="text-base font-semibold text-white">Status</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full ${hasToken ? "bg-emerald" : "bg-ruby"}`} />
            <span className="text-sm text-white/80">
              Meta Access Token: {hasToken ? "Configured" : "Not set"}
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

      {/* Step 1: Facebook Developer Setup */}
      <div className="bg-navy rounded-xl p-5 border border-white/5 space-y-4">
        <h2 className="text-base font-semibold text-white">
          Step 1: Get a Meta Access Token
        </h2>
        <ol className="space-y-3 text-sm text-white/70 list-decimal list-inside">
          <li>
            Go to{" "}
            <a
              href="https://developers.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold-light underline"
            >
              developers.facebook.com
            </a>{" "}
            and log in
          </li>
          <li>
            Click <strong className="text-white">My Apps</strong> &rarr;{" "}
            <strong className="text-white">Create App</strong> &rarr; Choose{" "}
            <strong className="text-white">Other</strong> &rarr;{" "}
            <strong className="text-white">Business</strong> type
          </li>
          <li>
            Name it <code className="bg-navy-deep px-1.5 py-0.5 rounded text-xs text-gold">Bordo Ad Research</code> and create
          </li>
          <li>
            Go to <strong className="text-white">Tools</strong> &rarr;{" "}
            <strong className="text-white">Graph API Explorer</strong>
          </li>
          <li>Select your app from the dropdown</li>
          <li>
            Click <strong className="text-white">Generate Access Token</strong> — this gives a short-lived token (valid ~1 hour, good for testing)
          </li>
          <li>
            For a longer-lived token (~60 days): go to{" "}
            <strong className="text-white">Settings &rarr; Basic</strong>, copy App ID and App Secret, then exchange:
            <pre className="mt-2 p-3 bg-navy-deep rounded-lg text-xs text-white/60 overflow-x-auto">
{`GET https://graph.facebook.com/v19.0/oauth/access_token?
  grant_type=fb_exchange_token&
  client_id={APP_ID}&
  client_secret={APP_SECRET}&
  fb_exchange_token={SHORT_LIVED_TOKEN}`}
            </pre>
          </li>
          <li>
            For production (non-expiring): Create a System User in Business Manager and generate a token with{" "}
            <code className="bg-navy-deep px-1.5 py-0.5 rounded text-xs text-gold">ads_read</code> permission
          </li>
        </ol>
      </div>

      {/* Step 2: Vercel Environment Variables */}
      <div className="bg-navy rounded-xl p-5 border border-white/5 space-y-4">
        <h2 className="text-base font-semibold text-white">
          Step 2: Add Environment Variables in Vercel
        </h2>
        <p className="text-sm text-white/70">
          In your Vercel project dashboard, go to{" "}
          <strong className="text-white">Settings &rarr; Environment Variables</strong>{" "}
          and add:
        </p>
        <div className="space-y-2">
          {[
            { name: "META_ACCESS_TOKEN", desc: "Your Facebook access token from Step 1", required: true },
            { name: "KV_REST_API_URL", desc: "Auto-set when you link a Vercel KV store", required: false },
            { name: "KV_REST_API_TOKEN", desc: "Auto-set when you link a Vercel KV store", required: false },
            { name: "CRON_SECRET", desc: "Random string to protect the cron endpoint", required: false },
          ].map((v) => (
            <div key={v.name} className="flex items-start gap-3 p-3 bg-navy-deep rounded-lg">
              <code className="text-xs text-gold shrink-0">{v.name}</code>
              <div className="text-xs text-white/50">
                {v.desc}
                {v.required && (
                  <span className="ml-1 text-ruby">(required)</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step 3: Vercel KV */}
      <div className="bg-navy rounded-xl p-5 border border-white/5 space-y-4">
        <h2 className="text-base font-semibold text-white">
          Step 3: Create a Vercel KV Store
        </h2>
        <ol className="space-y-3 text-sm text-white/70 list-decimal list-inside">
          <li>In Vercel dashboard, go to <strong className="text-white">Storage</strong></li>
          <li>Click <strong className="text-white">Create Database</strong> &rarr; <strong className="text-white">KV</strong></li>
          <li>Name it <code className="bg-navy-deep px-1.5 py-0.5 rounded text-xs text-gold">ad-research-kv</code></li>
          <li>Link it to your ad-research project — env vars are auto-populated</li>
          <li>Redeploy the app to pick up the new env vars</li>
        </ol>
        <p className="text-xs text-white/40">
          Without KV, the dashboard shows sample data. All features work, but scraped data won&apos;t persist across deployments.
        </p>
      </div>
    </div>
  );
}
