"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "cn";
import type { Category } from "@/lib/types";

const PRICE_PRESETS = [
  { label: "Under $50", min: undefined, max: 50 },
  { label: "$50 - $100", min: 50, max: 100 },
  { label: "Over $100", min: 100, max: undefined },
];

function FilterBody({ categories, activeCategory }: { categories: Category[]; activeCategory?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const minPrice = searchParams.get("min");
  const maxPrice = searchParams.get("max");

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

  return (
    <div className="space-y-8">
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
    </div>
  );
}

export function ProductFiltersSidebar({
  categories,
  activeCategory,
}: {
  categories: Category[];
  activeCategory?: string;
}) {
  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <FilterBody categories={categories} activeCategory={activeCategory} />
    </aside>
  );
}

export function ProductFiltersMobile({
  categories,
  activeCategory,
}: {
  categories: Category[];
  activeCategory?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="w-[80vw] max-w-xs">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto p-4">
          <FilterBody categories={categories} activeCategory={activeCategory} />
        </div>
      </SheetContent>
      <Button variant="outline" className="lg:hidden" onClick={() => setOpen(true)}>
        <SlidersHorizontal className="size-4" data-icon="inline-start" />
        Filters
      </Button>
    </Sheet>
  );
}
