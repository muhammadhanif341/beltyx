"use client";

import * as React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WishlistGrid } from "@/components/site/wishlist-grid";
import { createClient } from "@/lib/supabase/client";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import type { ProductWithRelations } from "@/lib/types";

export default function WishlistPage() {
  const productIds = useWishlistStore((s) => s.productIds);
  const [products, setProducts] = React.useState<ProductWithRelations[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      if (productIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("*, category:categories(*), images:product_images(*), variants:product_variants(*)")
        .in("id", productIds);
      if (!cancelled) {
        setProducts((data ?? []) as unknown as ProductWithRelations[]);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [productIds]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Saved</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">My Wishlist</h1>
      <p className="mt-2 text-sm text-muted-foreground">{productIds.length} saved item(s)</p>

      <div className="mt-8">
        {loading ? null : productIds.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl bg-card p-12 text-center ring-1 ring-border">
            <Heart className="size-10 text-muted-foreground" />
            <h2 className="mt-5 font-display text-2xl font-semibold">Your wishlist is empty</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tap the heart icon on any product to save it here.
            </p>
            <Button variant="hero" className="mt-5" render={<Link href="/shop" />}>
              Browse Products
            </Button>
          </div>
        ) : (
          <WishlistGrid products={products} />
        )}
      </div>
    </div>
  );
}
