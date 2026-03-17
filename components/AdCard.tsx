import type { CompetitorAd } from "@/lib/ad-insights";

interface AdCardProps {
  ad: CompetitorAd;
}

export function AdCard({ ad }: AdCardProps) {
  const card = (
    <div className="bg-navy rounded-xl border border-white/5 overflow-hidden hover:border-white/15 transition-colors group">
      {/* Creative image */}
      <div className="aspect-square bg-navy-light relative overflow-hidden">
        {ad.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ad.imageUrl}
            alt={ad.headline || "Ad creative"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 text-sm">
            No preview
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        {ad.headline && (
          <p className="text-sm font-semibold text-white line-clamp-2">
            {ad.headline}
          </p>
        )}
        {ad.bodyText && (
          <p className="text-xs text-white/60 line-clamp-2">{ad.bodyText}</p>
        )}

        {ad.cta && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gold/20 text-gold">
            {ad.cta}
          </span>
        )}

        <div className="flex items-center justify-between text-xs text-white/40 pt-1 border-t border-white/5">
          {ad.platform && <span>{ad.platform}</span>}
          {ad.startDate && <span>{ad.startDate}</span>}
        </div>
      </div>
    </div>
  );

  if (ad.adSnapshotUrl) {
    return (
      <a
        href={ad.adSnapshotUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {card}
      </a>
    );
  }

  return card;
}
