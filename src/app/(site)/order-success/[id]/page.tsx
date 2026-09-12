import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, formatOrderNumber, formatPrice } from "@/lib/format";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { OrderItem } from "@/lib/types";

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isSupabaseConfigured) notFound();

  const supabase = await createClient();
  const { data: order } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (!order) notFound();

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <CheckCircle2 className="mx-auto size-14 text-accent" />
        <h1 className="mt-5 font-display text-3xl font-semibold sm:text-4xl">Order Confirmed</h1>
        <p className="mt-2 text-muted-foreground">
          Thank you! Your order <span className="font-semibold text-foreground">{formatOrderNumber(order.id)}</span>{" "}
          has been placed on {formatDate(order.created_at)}.
        </p>
      </div>

      <div className="mt-10 rounded-3xl bg-card p-6 ring-1 ring-border">
        <div className="flex flex-col gap-3">
          {((items ?? []) as OrderItem[]).map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                {item.image_url && (
                  <Image src={item.image_url} alt={item.product_name} fill sizes="56px" className="object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.product_name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.variant_label ? `${item.variant_label} · ` : ""}Qty {item.quantity}
                </p>
              </div>
              <span className="text-sm font-semibold">{formatPrice(item.subtotal)}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-2 border-t border-border pt-5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-accent">
              <span>Discount</span>
              <span>-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{order.shipping_fee === 0 ? "Free" : formatPrice(order.shipping_fee)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-3 font-display text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-muted/60 p-4 text-sm">
          <p className="font-medium">
            {order.payment_method === "cod" ? "Cash on Delivery" : "Bank Transfer"}
          </p>
          <p className="mt-1 text-muted-foreground">
            {order.shipping_address.full_name} &middot; {order.shipping_address.line1},{" "}
            {order.shipping_address.city}, {order.shipping_address.country}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button variant="hero" size="lg" render={<Link href="/account/orders" />}>
          Track My Order
        </Button>
        <Button variant="outline" size="lg" render={<Link href="/shop" />}>
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}
