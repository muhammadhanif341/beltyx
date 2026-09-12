import type { Metadata } from "next";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckoutForm } from "@/components/site/checkout-form";
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

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <LogIn className="size-12 text-muted-foreground" />
        <h1 className="mt-6 font-display text-3xl font-semibold">Sign in to check out</h1>
        <p className="mt-2 text-muted-foreground">
          Create a free account or sign in so we can save your order to your account for tracking.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="hero" size="lg" render={<Link href="/login?next=/checkout" />}>
            Sign In
          </Button>
          <Button variant="outline" size="lg" render={<Link href="/signup?next=/checkout" />}>
            Create Account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-semibold">Checkout</h1>
      <div className="mt-8">
        <CheckoutForm defaultEmail={userEmail} />
      </div>
    </div>
  );
}
