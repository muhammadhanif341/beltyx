import type { Metadata } from "next";
import { CheckoutForm } from "@/components/site/checkout-form";
import { GuestCheckoutBanner } from "@/components/site/guest-checkout-banner";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  let userEmail: string | undefined;
  let isAuthenticated = false;

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isAuthenticated = Boolean(user);
    userEmail = user?.email;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-semibold">Checkout</h1>

      {!isAuthenticated && <GuestCheckoutBanner />}

      <div className="mt-8">
        <CheckoutForm defaultEmail={userEmail} />
      </div>
    </div>
  );
}
