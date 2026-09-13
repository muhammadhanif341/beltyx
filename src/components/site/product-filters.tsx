"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "cn";
import type { Category } from "@/lib/types";

const PRICE_PRESETS = [
  { label: "Under $50", min: undefined, max: 50 },
  { label: "$50 - $100", min: 50, max: 100 },
  { label: "Over $100", min: 100, max: undefined },
];

const RATING_PRESETS = [4, 3, 2];

interface FilterBodyProps {
  categories: Category[];
  activeCategory?: string;
  sizes: string[];
  colors: string[];
}

function FilterBody({ categories, activeCategory, sizes, colors }: FilterBodyProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const minPrice = searchParams.get("min");
  const maxPrice = searchParams.get("max");
  const activeSize = searchParams.get("size");
  const activeColor = searchParams.get("color");
  const inStockOnly = searchParams.get("inStock") === "1";
  const activeRating = searchParams.get("rating");

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value == null) params.delete(key);
    else params.set(key, value);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function applyPriceRange(min?: number, max?: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (min != null) params.set("min", String(min));
    else params.delete("min");
    if (max != null) params.set("max", String(max));
    else params.delete("max");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const isPricePresetActive = (min?: number, max?: number) =>
    (min == null ? !minPrice : minPrice === String(min)) &&
    (max == null ? !maxPrice : maxPrice === String(max));

  const hasAnyFilter = minPrice || maxPrice || activeSize || activeColor || inStockOnly || activeRating;

  return (
    <div className="space-y-8">
      {hasAnyFilter && (
        <button
          type="button"
          onClick={() => router.push(pathname)}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-accent"
        >
          <X className="size-3" />
          Clear all filters
        </button>
      )}

      <div>
        <h3 className="text-sm font-semibold">Category</h3>
        <div className="mt-3 flex flex-col gap-1">
          <Link
            href="/shop"
            className={cn(
              "rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted",
              !activeCategory && "bg-muted font-medium text-accent",
            )}
          >
            All Products
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className={cn(
                "rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted",
                activeCategory === cat.slug && "bg-muted font-medium text-accent",
              )}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold">Price</h3>
        <div className="mt-3 flex flex-col gap-1">
          {PRICE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPriceRange(preset.min, preset.max)}
              className={cn(
                "rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                isPricePresetActive(preset.min, preset.max) && "bg-muted font-medium text-accent",
              )}
            >
              {preset.label}
            </button>
          ))}
          {(minPrice || maxPrice) && (
            <button
              type="button"
              onClick={() => applyPriceRange(undefined, undefined)}
              className="mt-1 inline-flex items-center gap-1 self-start text-xs text-muted-foreground hover:text-accent"
            >
              <X className="size-3" />
              Clear price filter
            </button>
          )}
        </div>
      </div>

      {sizes.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold">Size</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => updateParam("size", activeSize === s ? null : s)}
                className={cn(
                  "flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-sm transition-colors",
                  activeSize === s ? "border-accent bg-accent text-accent-foreground" : "border-border hover:border-accent",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold">Color</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => updateParam("color", activeColor === c ? null : c)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  activeColor === c ? "border-accent bg-accent text-accent-foreground" : "border-border hover:border-accent",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold">Availability</h3>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <Checkbox
            checked={inStockOnly}
            onCheckedChange={(v) => updateParam("inStock", v ? "1" : null)}
          />
          In stock only
        </label>
      </div>

      <div>
        <h3 className="text-sm font-semibold">Rating</h3>
        <div className="mt-3 flex flex-col gap-1">
          {RATING_PRESETS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => updateParam("rating", activeRating === String(r) ? null : String(r))}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                activeRating === String(r) && "bg-muted font-medium text-accent",
              )}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={cn("size-3.5", i < r ? "fill-accent text-accent" : "text-muted-foreground")} />
              ))}
              <span className="ml-1">& up</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductFiltersSidebar(props: FilterBodyProps) {
  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <FilterBody {...props} />
    </aside>
  );
}

export function ProductFiltersMobile(props: FilterBodyProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="w-[80vw] max-w-xs">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto p-4">
          <FilterBody {...props} />
        </div>
      </SheetContent>
      <Button variant="outline" className="lg:hidden" onClick={() => setOpen(true)}>
        <SlidersHorizontal className="size-4" data-icon="inline-start" />
        Filters
      </Button>
    </Sheet>
  );
}
