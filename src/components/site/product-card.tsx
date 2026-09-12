"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuickViewDialog } from "@/components/site/quick-view-dialog";
import { cn } from "cn";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/lib/store/cart-store";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import type { ProductWithRelations } from "@/lib/types";
import { toast } from "sonner";

export function ProductCard({
  product,
  className,
  priority = false,
}: {
  product: ProductWithRelations;
  className?: string;
  priority?: boolean;
}) {
  const image = product.images?.[0]?.url ?? "https://placehold.co/900x900/1c1512/c9a24b?text=Beltyx";
  const hoverImage = product.images?.[1]?.url ?? null;
  const wishlist = useWishlistStore();
  const addToCart = useCartStore((s) => s.add);
  const isWishlisted = wishlist.has(product.id);
  const discountPct = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : null;

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    wishlist.toggle(product.id);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  }

  function handleQuickAdd() {
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
    <div
      className={cn(
        "group/product relative flex flex-col overflow-hidden rounded-3xl bg-card ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.35)]",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link href={`/product/${product.slug}`} className="absolute inset-0 z-0" aria-label={product.name}>
          <Image
            src={image}
            alt={product.images?.[0]?.alt ?? product.name}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 40vw, 90vw"
            className={cn(
              "object-cover transition-opacity duration-500",
              hoverImage && "group-hover/product:opacity-0",
            )}
          />
          {hoverImage && (
            <Image
              src={hoverImage}
              alt={product.images?.[1]?.alt ?? product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 40vw, 90vw"
              className="object-cover opacity-0 transition-opacity duration-500 group-hover/product:opacity-100"
            />
          )}
        </Link>

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <div className="flex flex-col gap-1.5">
            {product.is_new && (
              <Badge className="gold-gradient border-0 text-[#241a12]">New</Badge>
            )}
            {discountPct !== null && discountPct > 0 && (
              <Badge variant="secondary">-{discountPct}%</Badge>
            )}
          </div>
          <button
            type="button"
            onClick={handleWishlist}
            aria-label="Toggle wishlist"
            className="pointer-events-auto flex size-9 items-center justify-center rounded-full bg-background/80 backdrop-blur transition-colors hover:bg-background"
          >
            <Heart
              className={cn(
                "size-4 transition-colors",
                isWishlisted ? "fill-accent text-accent" : "text-foreground",
              )}
            />
          </button>
        </div>

        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex translate-y-2 items-center gap-2 opacity-0 transition-all duration-300 group-hover/product:translate-y-0 group-hover/product:opacity-100">
          <Button variant="hero" size="lg" className="pointer-events-auto flex-1" onClick={handleQuickAdd}>
            <ShoppingBag className="size-4" data-icon="inline-start" />
            Quick Add
          </Button>
          <QuickViewDialog product={product} image={image} />
        </div>
      </div>

      <Link href={`/product/${product.slug}`} className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs tracking-wide text-muted-foreground uppercase">
          {product.category?.name ?? product.material}
        </p>
        <h3 className="font-display text-lg leading-snug font-medium">{product.name}</h3>

        {product.rating_count > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3.5 fill-accent text-accent" />
            <span>{product.rating_avg.toFixed(1)}</span>
            <span>({product.rating_count})</span>
          </div>
        )}

        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="font-display text-xl font-semibold">{formatPrice(product.price)}</span>
          {product.compare_at_price && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.compare_at_price)}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
