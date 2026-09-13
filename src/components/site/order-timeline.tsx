import { Ban, RotateCcw } from "lucide-react";
import { cn } from "cn";
import { formatDate } from "@/lib/format";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS, type OrderStatus, type OrderStatusHistoryEntry } from "@/lib/types";

export function OrderTimeline({
  status,
  history,
}: {
  status: OrderStatus;
  history: OrderStatusHistoryEntry[];
}) {
  if (status === "cancelled" || status === "returned") {
    const Icon = status === "cancelled" ? Ban : RotateCcw;
    const entry = history.find((h) => h.status === status);
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
        <Icon className="size-5 shrink-0 text-destructive" />
        <div>
          <p className="text-sm font-semibold text-destructive">{ORDER_STATUS_LABELS[status]}</p>
          {entry && <p className="text-xs text-muted-foreground">{formatDate(entry.created_at)}</p>}
        </div>
      </div>
    );
  }

  const currentIndex = ORDER_STATUS_FLOW.indexOf(status);
  const historyByStatus = new Map(history.map((h) => [h.status, h.created_at]));

  return (
    <ol className="flex flex-col gap-0 sm:flex-row sm:items-start">
      {ORDER_STATUS_FLOW.map((s, i) => {
        const done = i <= currentIndex;
        const timestamp = historyByStatus.get(s);
        return (
          <li key={s} className="flex flex-1 items-start gap-3 sm:flex-col sm:items-center sm:gap-2 sm:text-center">
            <div className="flex items-center sm:w-full">
              {i > 0 && (
                <span
                  className={cn("hidden h-px flex-1 sm:block", i <= currentIndex ? "bg-accent" : "bg-border")}
                />
              )}
              <span
                className={cn(
                  "flex size-3 shrink-0 rounded-full ring-4",
                  done ? "bg-accent ring-accent/15" : "bg-muted ring-transparent",
                )}
              />
              {i < ORDER_STATUS_FLOW.length - 1 && (
                <span
                  className={cn("hidden h-px flex-1 sm:block", i < currentIndex ? "bg-accent" : "bg-border")}
                />
              )}
            </div>
            <div className="pb-4 sm:pb-0">
              <p className={cn("text-xs font-medium", done ? "text-foreground" : "text-muted-foreground")}>
                {ORDER_STATUS_LABELS[s]}
              </p>
              {timestamp && <p className="text-[10px] text-muted-foreground">{formatDate(timestamp)}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
