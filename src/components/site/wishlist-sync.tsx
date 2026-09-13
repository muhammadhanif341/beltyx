"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { useWishlistStore } from "@/lib/store/wishlist-store";

/** Syncs the client-side wishlist to Supabase `wishlists` for signed-in users:
 * merges the guest (localStorage) wishlist into the DB on sign-in, then
 * mirrors every subsequent change to the DB for that user. */
export function WishlistSync() {
  const supabase = React.useMemo(() => createClient(), []);
  const userIdRef = React.useRef<string | null>(null);
  const initializingRef = React.useRef(false);

  React.useEffect(() => {
    let cancelled = false;

    async function loadAndMerge(userId: string) {
      initializingRef.current = true;
      const localIds = useWishlistStore.getState().productIds;

      if (localIds.length > 0) {
        await supabase.from("wishlists").upsert(
          localIds.map((productId) => ({ user_id: userId, product_id: productId })),
          { onConflict: "user_id,product_id" },
        );
      }

      const { data } = await supabase.from("wishlists").select("product_id").eq("user_id", userId);
      if (cancelled) return;
      useWishlistStore.getState().hydrate((data ?? []).map((row) => row.product_id));
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

    const unsubscribeStore = useWishlistStore.subscribe((state, prevState) => {
      const userId = userIdRef.current;
      if (!userId || initializingRef.current || state.productIds === prevState.productIds) return;

      supabase
        .from("wishlists")
        .delete()
        .eq("user_id", userId)
        .then(() => {
          if (state.productIds.length === 0) return;
          return supabase.from("wishlists").insert(
            state.productIds.map((productId) => ({ user_id: userId, product_id: productId })),
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
