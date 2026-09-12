"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "cn";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/lib/store/cart-store";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import type { ProductWithRelations } from "@/lib/types";
import { toast } from "sonner";

export function ProductOptions({ product }: { product: ProductWithRelations }) {
  const variants = product.variants ?? [];
  const sizes = Array.from(new Set(variants.map((v) => v.size).filter(Boolean))) as string[];
  const colors = Array.from(
    new Map(variants.filter((v) => v.color).map((v) => [v.color, v.color_hex])).entries(),
  );

  const [size, setSize] = React.useState<string | undefined>(sizes[0]);
  const [color, setColor] = React.useState<string | undefined>(colors[0]?.[0] ?? undefined);
  const [qty, setQty] = React.useState(1);

  const selectedVariant = variants.find(
    (v) => (sizes.length === 0 || v.size === size) && (colors.length === 0 || v.color === color),
  );

  const price = selectedVariant?.price_override ?? product.price;
  const stock = selectedVariant?.stock ?? product.stock;
  const outOfStock = stock <= 0;

  const addToCart = useCartStore((s) => s.add);
  const wishlist = useWishlistStore();
  const router = useRouter();
  const isWishlisted = wishlist.has(product.id);

  function buildLine() {
    const variantLabel = [size, color].filter(Boolean).join(" / ") || null;
    return {
      productId: product.id,
      variantId: selectedVariant?.id ?? null,
      slug: product.slug,
      name: product.name,
      image: product.images?.[0]?.url ?? null,
      unitPrice: price,
      variantLabel,
      maxStock: stock,
    };
  }

  function handleAddToCart() {
    if (outOfStock) return;
    addToCart(buildLine(), qty);
    toast.success(`${product.name} added to bag`);
  }

  function handleBuyNow() {
    if (outOfStock) return;
    addToCart(buildLine(), qty);
    router.push("/checkout");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-3xl font-semibold">{formatPrice(price)}</span>
        {product.compare_at_price && (
          <span className="text-lg text-muted-foreground line-through">
            {formatPrice(product.compare_at_price)}
          </span>
        )}
      </div>

      {colors.length > 0 && (
        <div>
          <p className="text-sm font-medium">Color{color ? `: ${color}` : ""}</p>
          <div className="mt-2 flex flex-wrap gap-2.5">
            {colors.map(([c, hex]) => (
              <button
                key={c}
                type="button"
                aria-label={c ?? undefined}
                onClick={() => setColor(c ?? undefined)}
                className={cn(
                  "size-9 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all",
                  color === c ? "ring-accent" : "ring-transparent hover:ring-border",
                )}
                style={{ backgroundColor: hex ?? "#999" }}
              />
            ))}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div>
          <p className="text-sm font-medium">Size</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={cn(
                  "flex h-10 min-w-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition-colors",
                  size === s
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border hover:border-accent",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-sm font-medium">Quantity</p>
        <div className="mt-2 inline-flex items-center rounded-full border border-border">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex size-10 items-center justify-center rounded-l-full hover:bg-muted"
            aria-label="Decrease quantity"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-10 text-center text-sm font-medium">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(stock || 99, q + 1))}
            className="flex size-10 items-center justify-center rounded-r-full hover:bg-muted"
            aria-label="Increase quantity"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {outOfStock ? "Out of stock" : `${stock} in stock`}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="xl" variant="hero" className="flex-1" onClick={handleAddToCart} disabled={outOfStock}>
          <ShoppingBag className="size-4" data-icon="inline-start" />
          Add to Bag
        </Button>
        <Button size="xl" variant="heroOutline" className="flex-1" onClick={handleBuyNow} disabled={outOfStock}>
          <Zap className="size-4" data-icon="inline-start" />
          Buy Now
        </Button>
        <Button
          size="xl"
          variant="outline"
          className="sm:w-14"
          aria-label="Toggle wishlist"
          onClick={() => {
            wishlist.toggle(product.id);
            toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
          }}
        >
          <Heart className={cn("size-5", isWishlisted && "fill-accent text-accent")} />
        </Button>
      </div>
    </div>
  );
}
