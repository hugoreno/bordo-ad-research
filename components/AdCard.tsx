import type { CompetitorAd } from "@/lib/ad-insights";

interface AdCardProps {
  ad: CompetitorAd;
}

const layoutLabels: Record<string, string> = {
  "hero-image-top": "Hero Image",
  "text-overlay": "Text Overlay",
  "split-screen": "Split Screen",
  "character-focused": "Character",
  "jackpot-showcase": "Jackpot",
};

export function AdCard({ ad }: AdCardProps) {
  return (
    <div className="bg-navy rounded-xl border border-white/5 overflow-hidden hover:border-white/15 transition-colors">
      {/* Color bar from dominant colors */}
      <div className="h-24 flex">
        {ad.dominantColors.length > 0 ? (
          ad.dominantColors.map((color, i) => (
            <div
              key={i}
              className="flex-1"
              style={{ backgroundColor: color }}
            />
          ))
        ) : (
          <div className="flex-1 bg-navy-light" />
        )}
      </div>

      <div className="p-4 space-y-3">
        {ad.headline && (
          <p className="text-sm font-semibold text-white line-clamp-2">
            {ad.headline}
          </p>
        )}
        {ad.bodyText && (
          <p className="text-xs text-white/60 line-clamp-3">{ad.bodyText}</p>
        )}

        <div className="flex flex-wrap gap-2">
          {ad.cta && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gold/20 text-gold">
              {ad.cta}
            </span>
          )}
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/70">
            {layoutLabels[ad.layout] || ad.layout}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-white/40 pt-1 border-t border-white/5">
          {ad.platform && <span>{ad.platform}</span>}
          {ad.startDate && (
            <span>{new Date(ad.startDate).toLocaleDateString()}</span>
          )}
        </div>

        {ad.adSnapshotUrl && (
          <a
            href={ad.adSnapshotUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gold hover:text-gold-light transition-colors"
          >
            View on Meta Ad Library &rarr;
          </a>
        )}
      </div>
    </div>
  );
}
