import Link from "next/link";
import { COMPETITORS } from "@/lib/ad-insights";

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-navy border-r border-white/10 flex flex-col">
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="block">
          <h1 className="text-lg font-bold text-gold">Ad Research</h1>
          <p className="text-xs text-slate-dim mt-1">Bordo Games</p>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
        >
          <span className="text-base">&#9632;</span>
          Overview
        </Link>
        <Link
          href="/competitors"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
        >
          <span className="text-base">&#9670;</span>
          All Competitors
        </Link>

        <div className="pt-4 pb-2">
          <p className="px-3 text-xs font-medium text-slate-dim uppercase tracking-wider">
            Competitors
          </p>
        </div>

        {COMPETITORS.map((c) => (
          <Link
            key={c.slug}
            href={`/competitors/${c.slug}`}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: c.color }}
            />
            {c.name}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <Link
          href="/setup"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors"
        >
          <span className="text-base">&#9881;</span>
          Setup
        </Link>
      </div>
    </aside>
  );
}
