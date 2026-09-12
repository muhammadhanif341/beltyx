import type { Metadata } from "next";
import Link from "next/link";
import { Package, Star, User as UserIcon } from "lucide-react";
import { SignInPrompt } from "@/components/site/sign-in-prompt";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return <SignInPrompt next="/account" />;

  const supabase = await createClient();
  const [{ count: orderCount }, { count: reviewCount }] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-3xl bg-card p-6 ring-1 ring-border">
        <div className="flex items-center gap-4">
          <span className="flex size-14 items-center justify-center rounded-full bg-accent/10 text-accent">
            <UserIcon className="size-6" />
          </span>
          <div>
            <p className="font-display text-xl font-semibold">
              {user.user_metadata?.full_name ?? "Welcome back"}
            </p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/account/orders"
          className="flex items-center gap-4 rounded-3xl bg-card p-6 ring-1 ring-border transition-colors hover:ring-accent"
        >
          <Package className="size-8 text-accent" />
          <div>
            <p className="font-display text-2xl font-semibold">{orderCount ?? 0}</p>
            <p className="text-sm text-muted-foreground">Orders placed</p>
          </div>
        </Link>
        <Link
          href="/account/reviews"
          className="flex items-center gap-4 rounded-3xl bg-card p-6 ring-1 ring-border transition-colors hover:ring-accent"
        >
          <Star className="size-8 text-accent" />
          <div>
            <p className="font-display text-2xl font-semibold">{reviewCount ?? 0}</p>
            <p className="text-sm text-muted-foreground">Reviews written</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
