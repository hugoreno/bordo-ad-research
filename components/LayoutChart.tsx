"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { LayoutPattern } from "@/lib/ad-insights";

interface LayoutChartProps {
  data: { layout: LayoutPattern; count: number; percentage: number }[];
}

const LAYOUT_COLORS: Record<string, string> = {
  "hero-image-top": "#D4A853",
  "text-overlay": "#8B5CF6",
  "split-screen": "#10B981",
  "character-focused": "#F59E0B",
  "jackpot-showcase": "#EF4444",
};

const LAYOUT_LABELS: Record<string, string> = {
  "hero-image-top": "Hero Image",
  "text-overlay": "Text Overlay",
  "split-screen": "Split Screen",
  "character-focused": "Character",
  "jackpot-showcase": "Jackpot",
};

export function LayoutChart({ data }: LayoutChartProps) {
  const chartData = data.map((d) => ({
    name: LAYOUT_LABELS[d.layout] || d.layout,
    value: d.count,
    percentage: d.percentage,
    color: LAYOUT_COLORS[d.layout] || "#8A8AA0",
  }));

  return (
    <div className="bg-navy rounded-xl p-5 border border-white/5">
      <h3 className="text-sm font-semibold text-white mb-4">Layout Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A1A2E",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "#FFF8F0",
                fontSize: 12,
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, _name: any, entry: any) => [
                `${value} ads (${entry?.payload?.percentage ?? 0}%)`,
                "Count",
              ]}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, color: "#8A8AA0" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
