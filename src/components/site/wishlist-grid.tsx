"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/lib/store/cart-store";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import type { ProductWithRelations } from "@/lib/types";
import { toast } from "sonner";

export function WishlistGrid({ products }: { products: ProductWithRelations[] }) {
  const addToCart = useCartStore((s) => s.add);
  const removeFromWishlist = useWishlistStore((s) => s.remove);

  function handleMoveToCart(product: ProductWithRelations) {
    const image = product.images?.[0]?.url ?? null;
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
    removeFromWishlist(product.id);
    toast.success(`${product.name} moved to bag`);
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => {
        const image = product.images?.[0]?.url ?? "https://placehold.co/900x900/1c1512/c9a24b?text=Beltyx";
        return (
          <div key={product.id} className="flex flex-col overflow-hidden rounded-3xl bg-card ring-1 ring-border">
            <div className="relative aspect-square bg-muted">
              <Link href={`/product/${product.slug}`}>
                <Image src={image} alt={product.name} fill sizes="(min-width: 1024px) 25vw, 45vw" className="object-cover" />
              </Link>
              <button
                type="button"
                onClick={() => removeFromWishlist(product.id)}
                aria-label="Remove from wishlist"
                className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-background/80 backdrop-blur hover:bg-background"
              >
                <X className="size-3.5" />
              </button>
            </div>
            <div className="flex flex-1 flex-col gap-1 p-4">
              <Link href={`/product/${product.slug}`} className="font-display text-base font-medium leading-snug">
                {product.name}
              </Link>
              <span className="text-sm font-semibold">{formatPrice(product.price)}</span>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => handleMoveToCart(product)}>
                <ShoppingBag className="size-3.5" data-icon="inline-start" />
                Move to Cart
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
