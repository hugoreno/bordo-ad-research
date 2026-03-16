"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface CTAChartProps {
  data: { text: string; count: number; percentage: number }[];
}

export function CTAChart({ data }: CTAChartProps) {
  return (
    <div className="bg-navy rounded-xl p-5 border border-white/5">
      <h3 className="text-sm font-semibold text-white mb-4">Top CTAs</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 80, right: 20 }}>
            <XAxis type="number" tick={{ fill: "#8A8AA0", fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="text"
              tick={{ fill: "#FFF8F0", fontSize: 11 }}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A1A2E",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "#FFF8F0",
                fontSize: 12,
              }}
              formatter={(value: number) => [`${value} ads`, "Count"]}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={i === 0 ? "#D4A853" : "#D4A85380"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
