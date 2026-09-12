"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, ShoppingBag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/lib/store/cart-store";
import type { ProductWithRelations } from "@/lib/types";
import { toast } from "sonner";

export function QuickViewDialog({
  product,
  image,
}: {
  product: ProductWithRelations;
  image: string;
}) {
  const addToCart = useCartStore((s) => s.add);
  const discountPct = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : null;

  function handleAdd() {
    addToCart({
      productId: product.id,
      variantId: null,
      slug: product.slug,
      name: product.name,
      image,
      unitPrice: product.price,
      variantLabel: null,
      maxStock: product.stock,
    });
    toast.success(`${product.name} added to bag`);
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <button
            type="button"
            aria-label="Quick view"
            className="pointer-events-auto flex size-11 shrink-0 items-center justify-center rounded-full bg-background/90 text-foreground backdrop-blur transition-colors hover:bg-background"
          />
        }
      >
        <Eye className="size-4" />
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100%-2rem)] gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="relative aspect-square bg-muted sm:aspect-auto">
            <Image src={image} alt={product.name} fill sizes="(min-width: 640px) 320px, 90vw" className="object-cover" />
            {discountPct !== null && discountPct > 0 && (
              <span className="absolute top-3 left-3 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                -{discountPct}%
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3 p-6">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">
              {product.category?.name ?? product.material}
            </p>
            <h2 className="font-display text-2xl leading-snug font-semibold">{product.name}</h2>

            {product.rating_count > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="size-4 fill-accent text-accent" />
                <span>{product.rating_avg.toFixed(1)}</span>
                <span>({product.rating_count} reviews)</span>
              </div>
            )}

            <div className="flex items-baseline gap-2">
              <span className="font-display text-2xl font-semibold">{formatPrice(product.price)}</span>
              {product.compare_at_price && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.compare_at_price)}
                </span>
              )}
            </div>

            {product.description && (
              <p className="line-clamp-4 text-sm text-muted-foreground">{product.description}</p>
            )}

            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Button variant="hero" size="lg" className="flex-1" onClick={handleAdd}>
                <ShoppingBag className="size-4" data-icon="inline-start" />
                Add to Cart
              </Button>
              <DialogClose
                render={
                  <Link
                    href={`/product/${product.slug}`}
                    className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-border text-sm font-semibold transition-colors hover:bg-muted"
                  />
                }
              >
                View Full Details
              </DialogClose>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
