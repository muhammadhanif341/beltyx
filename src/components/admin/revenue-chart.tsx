"use client";

import * as React from "react";
import { formatPrice } from "@/lib/format";

interface DayRevenue {
  label: string;
  value: number;
}

export function RevenueChart({
  data,
  valueLabel = "Revenue",
  formatValue = formatPrice,
}: {
  data: DayRevenue[];
  valueLabel?: string;
  formatValue?: (n: number) => string;
}) {
  const [hovered, setHovered] = React.useState<number | null>(null);
  const [showTable, setShowTable] = React.useState(false);
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div>
      <div className="flex items-end gap-1.5 sm:gap-2" style={{ height: 180 }}>
        {data.map((day, i) => {
          const heightPct = Math.max(2, (day.value / max) * 100);
          return (
            <div
              key={day.label}
              className="group relative flex flex-1 flex-col items-center justify-end"
              style={{ height: "100%" }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
            >
              {hovered === i && (
                <div className="absolute -top-9 z-10 whitespace-nowrap rounded-lg bg-popover px-2.5 py-1 text-xs font-medium text-popover-foreground shadow-md ring-1 ring-foreground/10">
                  {formatValue(day.value)}
                </div>
              )}
              <div
                className="w-full rounded-t-md bg-chart-1 transition-opacity group-hover:opacity-80"
                style={{ height: `${heightPct}%` }}
              />
              <span className="mt-2 text-[10px] text-muted-foreground">{day.label}</span>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setShowTable((v) => !v)}
        className="mt-4 text-xs text-accent hover:underline"
      >
        {showTable ? "Hide" : "View"} as table
      </button>

      {showTable && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-1.5 pr-4 font-medium">Date</th>
                <th className="py-1.5 font-medium">{valueLabel}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((day) => (
                <tr key={day.label} className="border-b border-border last:border-0">
                  <td className="py-1.5 pr-4">{day.label}</td>
                  <td className="py-1.5">{formatValue(day.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
