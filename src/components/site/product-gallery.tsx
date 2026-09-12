"use client";

import * as React from "react";
import Image from "next/image";
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

  return (
    <div className="flex flex-col gap-3">
      <div className="leather-glow relative aspect-square w-full overflow-hidden rounded-3xl bg-card ring-1 ring-border">
        <Image
          key={gallery[active].url}
          src={gallery[active].url}
          alt={gallery[active].alt ?? productName}
          fill
          priority
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>

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
    </div>
  );
}
