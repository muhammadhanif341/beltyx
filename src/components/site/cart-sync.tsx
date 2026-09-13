"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { useCartStore, type CartLine } from "@/lib/store/cart-store";

interface CartItemRow {
  product_id: string;
  variant_id: string | null;
  quantity: number;
  product: {
    slug: string;
    name: string;
    price: number;
    stock: number;
    images: { url: string }[] | null;
  } | null;
  variant: {
    price_override: number | null;
    stock: number;
    size: string | null;
    color: string | null;
  } | null;
}

function toCartLine(row: CartItemRow): CartLine | null {
  if (!row.product) return null;
  const variantLabel = row.variant ? [row.variant.size, row.variant.color].filter(Boolean).join(" / ") || null : null;
  return {
    productId: row.product_id,
    variantId: row.variant_id,
    slug: row.product.slug,
    name: row.product.name,
    image: row.product.images?.[0]?.url ?? null,
    unitPrice: row.variant?.price_override ?? row.product.price,
    variantLabel,
    quantity: row.quantity,
    maxStock: row.variant?.stock ?? row.product.stock,
  };
}

/** Syncs the client-side cart to Supabase `cart_items` for signed-in users:
 * merges the guest (localStorage) cart into the DB cart on sign-in, then
 * mirrors every subsequent cart change to the DB for that user. */
export function CartSync() {
  const supabase = React.useMemo(() => createClient(), []);
  const userIdRef = React.useRef<string | null>(null);
  const initializingRef = React.useRef(false);

  React.useEffect(() => {
    let cancelled = false;

    async function loadAndMerge(userId: string) {
      initializingRef.current = true;
      const localLines = useCartStore.getState().lines;

      if (localLines.length > 0) {
        await supabase.from("cart_items").upsert(
          localLines.map((l) => ({
            user_id: userId,
            product_id: l.productId,
            variant_id: l.variantId,
            quantity: l.quantity,
          })),
          { onConflict: "user_id,product_id,variant_id" },
        );
      }

      const { data } = await supabase
        .from("cart_items")
        .select(
          "product_id, variant_id, quantity, product:products(slug, name, price, stock, images:product_images(url)), variant:product_variants(price_override, stock, size, color)",
        )
        .eq("user_id", userId);

      if (cancelled) return;
      const merged = ((data ?? []) as unknown as CartItemRow[])
        .map(toCartLine)
        .filter((l): l is CartLine => l !== null);
      useCartStore.getState().hydrate(merged);
      initializingRef.current = false;
    }

    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      userIdRef.current = data.user?.id ?? null;
      if (data.user) loadAndMerge(data.user.id);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user && session.user.id !== userIdRef.current) {
        userIdRef.current = session.user.id;
        loadAndMerge(session.user.id);
      }
      if (event === "SIGNED_OUT") {
        userIdRef.current = null;
      }
    });

    const unsubscribeStore = useCartStore.subscribe((state, prevState) => {
      const userId = userIdRef.current;
      if (!userId || initializingRef.current || state.lines === prevState.lines) return;

      supabase
        .from("cart_items")
        .delete()
        .eq("user_id", userId)
        .then(() => {
          if (state.lines.length === 0) return;
          return supabase.from("cart_items").insert(
            state.lines.map((l) => ({
              user_id: userId,
              product_id: l.productId,
              variant_id: l.variantId,
              quantity: l.quantity,
            })),
          );
        });
    });

    return () => {
      cancelled = true;
      authListener.subscription.unsubscribe();
      unsubscribeStore();
    };
  }, [supabase]);

  return null;
}
