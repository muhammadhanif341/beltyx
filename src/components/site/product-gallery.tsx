"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { cn } from "cn";
import type { ProductImage } from "@/lib/types";

export function ProductGallery({
  images,
  productName,
}: {
  images: ProductImage[];
  productName: string;
}) {
  const gallery = images.length > 0
    ? images
    : [{ id: "placeholder", url: "https://placehold.co/1000x1000/1c1512/c9a24b?text=Beltyx", alt: productName, product_id: "", sort_order: 0, created_at: "" }];
  const [active, setActive] = React.useState(0);
  const [fullscreen, setFullscreen] = React.useState(false);
  const touchStartX = React.useRef<number | null>(null);

  const next = React.useCallback(() => setActive((i) => (i + 1) % gallery.length), [gallery.length]);
  const prev = React.useCallback(() => setActive((i) => (i - 1 + gallery.length) % gallery.length), [gallery.length]);

  React.useEffect(() => {
    if (!fullscreen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setFullscreen(false);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen, next, prev]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      if (delta < 0) next();
      else prev();
    }
    touchStartX.current = null;
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setFullscreen(true)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label="Open fullscreen image viewer"
        className="leather-glow group relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-3xl bg-card ring-1 ring-border"
      >
        <Image
          key={gallery[active].url}
          src={gallery[active].url}
          alt={gallery[active].alt ?? productName}
          fill
          priority
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <span className="absolute right-3 bottom-3 flex size-9 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur">
          <Expand className="size-4" />
        </span>
      </button>

      {gallery.length > 1 && (
        <div className="no-scrollbar flex gap-3 overflow-x-auto">
          {gallery.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-xl bg-card ring-1 transition-all sm:size-20",
                active === i ? "ring-2 ring-accent" : "ring-border hover:ring-foreground/30",
              )}
            >
              <Image src={img.url} alt={img.alt ?? productName} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {fullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            aria-label="Close fullscreen viewer"
            className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="size-5" />
          </button>

          {gallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Previous image"
                className="absolute left-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next image"
                className="absolute right-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}

          <div className="relative h-full max-h-[85vh] w-full max-w-4xl">
            <Image
              src={gallery[active].url}
              alt={gallery[active].alt ?? productName}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
