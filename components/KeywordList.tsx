interface KeywordListProps {
  keywords: { word: string; count: number }[];
}

export function KeywordList({ keywords }: KeywordListProps) {
  const maxCount = keywords[0]?.count ?? 1;

  return (
    <div className="bg-navy rounded-xl p-5 border border-white/5">
      <h3 className="text-sm font-semibold text-white mb-4">
        Headline Keywords
      </h3>
      <div className="flex flex-wrap gap-2">
        {keywords.map((kw) => {
          const opacity = 0.3 + (kw.count / maxCount) * 0.7;
          return (
            <span
              key={kw.word}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
              style={{
                backgroundColor: `rgba(212, 168, 83, ${opacity * 0.2})`,
                color: `rgba(232, 201, 122, ${opacity})`,
              }}
            >
              {kw.word}
              <span className="text-white/30">{kw.count}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
