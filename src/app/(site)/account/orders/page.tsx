import type { Metadata } from "next";
import Link from "next/link";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SignInPrompt } from "@/components/site/sign-in-prompt";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatOrderNumber, formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS, ORDER_STATUS_VARIANT, type Order } from "@/lib/types";

export const metadata: Metadata = { title: "My Orders" };

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) return <SignInPrompt next="/account/orders" />;

  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const list = (orders ?? []) as Order[];

  if (list.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-3xl bg-card p-12 text-center ring-1 ring-border">
        <Package className="size-10 text-muted-foreground" />
        <h2 className="mt-5 font-display text-2xl font-semibold">No orders yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          When you place an order, it will show up here.
        </p>
        <Link href="/shop" className="mt-5 text-sm font-medium text-accent hover:underline">
          Start Shopping →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {list.map((order) => (
        <Link
          key={order.id}
          href={`/account/orders/${order.id}`}
          className="flex flex-col gap-3 rounded-2xl bg-card p-5 ring-1 ring-border transition-colors hover:ring-accent sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-semibold">{formatOrderNumber(order.id)}</p>
            <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">{formatPrice(order.total)}</span>
            <Badge variant={ORDER_STATUS_VARIANT[order.status]}>
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
          </div>
        </Link>
      ))}
    </div>
  );
}
