"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

export type DateRangeKey = "today" | "7d" | "30d" | "year" | "custom";

export interface ResolvedDateRange {
  from: string;
  to: string;
  key: DateRangeKey;
}

export function resolveDateRange(range?: string, from?: string, to?: string): ResolvedDateRange {
  const now = new Date();
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  if (range === "custom" && from && to) {
    const start = new Date(`${from}T00:00:00`);
    const end = new Date(`${to}T23:59:59`);
    return { from: start.toISOString(), to: end.toISOString(), key: "custom" };
  }

  let start: Date;
  const key: DateRangeKey = (range as DateRangeKey) || "30d";
  switch (key) {
    case "today":
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      break;
    case "7d":
      start = new Date(now);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      break;
    case "year":
      start = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      start = new Date(now);
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      return { from: start.toISOString(), to: endOfToday.toISOString(), key: "30d" };
  }
  return { from: start.toISOString(), to: endOfToday.toISOString(), key };
}

const PRESETS: { key: DateRangeKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "year", label: "This Year" },
];

export function DateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeKey = (searchParams.get("range") as DateRangeKey) || "30d";
  const [customFrom, setCustomFrom] = React.useState(searchParams.get("from") ?? "");
  const [customTo, setCustomTo] = React.useState(searchParams.get("to") ?? "");
  const [showCustom, setShowCustom] = React.useState(activeKey === "custom");

  function applyPreset(key: DateRangeKey) {
    setShowCustom(false);
    router.push(`${pathname}?range=${key}`);
  }

  function applyCustom() {
    if (!customFrom || !customTo) return;
    router.push(`${pathname}?range=custom&from=${customFrom}&to=${customTo}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((preset) => (
        <button
          key={preset.key}
          type="button"
          onClick={() => applyPreset(preset.key)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            activeKey === preset.key && !showCustom
              ? "gold-gradient text-[#241a12]"
              : "bg-muted text-muted-foreground hover:text-foreground",
          )}
        >
          {preset.label}
        </button>
      ))}
      <button
        type="button"
        onClick={() => setShowCustom((v) => !v)}
        className={cn(
          "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
          activeKey === "custom" || showCustom
            ? "gold-gradient text-[#241a12]"
            : "bg-muted text-muted-foreground hover:text-foreground",
        )}
      >
        Custom Range
      </button>
      {showCustom && (
        <div className="flex items-center gap-2">
          <Input type="date" className="h-8 w-36 text-xs" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
          <span className="text-xs text-muted-foreground">to</span>
          <Input type="date" className="h-8 w-36 text-xs" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
          <button type="button" onClick={applyCustom} className="rounded-full bg-accent/15 px-3 py-1.5 text-xs font-medium text-accent">
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
