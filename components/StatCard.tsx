interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
}

export function StatCard({ label, value, subtitle }: StatCardProps) {
  return (
    <div className="bg-navy rounded-xl p-5 border border-white/5">
      <p className="text-sm text-slate-dim">{label}</p>
      <p className="text-3xl font-bold text-white mt-1">{value}</p>
      {subtitle && (
        <p className="text-xs text-slate-dim mt-1">{subtitle}</p>
      )}
    </div>
  );
}
