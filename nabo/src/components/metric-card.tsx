"use client";

import { MetricData } from "@/lib/data";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

interface MetricCardProps {
  metric: MetricData;
}

export function MetricCard({ metric }: MetricCardProps) {
  const deltaColor =
    metric.deltaType === "positive"
      ? "text-green-600"
      : metric.deltaType === "negative"
      ? "text-red-600"
      : "text-muted-foreground";

  const deltaBg =
    metric.deltaType === "positive"
      ? "bg-green-50"
      : metric.deltaType === "negative"
      ? "bg-red-50"
      : "bg-muted/50";

  const lineColor =
    metric.deltaType === "positive"
      ? "#16a34a"
      : metric.deltaType === "negative"
      ? "#dc2626"
      : "#7a7a7a";

  const DeltaIcon =
    metric.deltaType === "positive"
      ? TrendingUp
      : metric.deltaType === "negative"
      ? TrendingDown
      : Minus;

  const chartData = metric.sparkline.map((v) => ({ value: v }));

  return (
    <div className="rounded-lg border border-border bg-white p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
          {metric.label}
        </span>
        <span
          className={`inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded ${deltaBg} ${deltaColor}`}
        >
          <DeltaIcon className="w-2.5 h-2.5" />
          {metric.delta}
        </span>
      </div>
      <div className="text-xl font-semibold text-onyx mb-2">{metric.value}</div>
      <div className="h-8">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
