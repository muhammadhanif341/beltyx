import { cn } from "cn";

export function StockStatus({
  stock,
  lowStockThreshold = 5,
  className,
}: {
  stock: number;
  lowStockThreshold?: number;
  className?: string;
}) {
  if (stock <= 0) {
    return <span className={cn("text-xs font-medium text-destructive", className)}>Out of Stock</span>;
  }
  if (stock <= lowStockThreshold) {
    return <span className={cn("text-xs font-medium text-amber-500", className)}>Only {stock} left</span>;
  }
  return <span className={cn("text-xs font-medium text-accent", className)}>In Stock</span>;
}
