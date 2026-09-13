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

        <div className="mt-5 grid grid-cols-1 gap-3 rounded-2xl bg-muted/60 p-4 text-sm sm:grid-cols-2">
          <div>
            <p className="font-medium capitalize">
              {order.payment_method.replace("_", " ")} &middot; {order.payment_status}
            </p>
            <p className="mt-1 text-muted-foreground">
              {order.shipping_address.full_name} &middot; {order.shipping_address.line1},{" "}
              {order.shipping_address.city}, {order.shipping_address.country}
            </p>
          </div>
          {order.estimated_delivery && (
            <div className="sm:text-right">
              <p className="font-medium">Estimated Delivery</p>
              <p className="mt-1 text-muted-foreground">{formatDate(order.estimated_delivery)}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        {order.user_id ? (
          <Button variant="hero" size="lg" render={<Link href={`/account/orders/${order.id}`} />}>
            Track Order
          </Button>
        ) : null}
        <Button variant={order.user_id ? "outline" : "hero"} size="lg" render={<Link href="/shop" />}>
          Continue Shopping
        </Button>
      </div>

      {!order.user_id && (
        <div className="mt-10 rounded-3xl bg-card p-6 text-center ring-1 ring-border">
          <p className="font-display text-lg font-semibold">Want to track this order easily next time?</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create an account to track future orders faster — using {order.contact_email}.
          </p>
          <Button
            variant="outline"
            size="lg"
            className="mt-4"
            render={<Link href={`/signup?email=${encodeURIComponent(order.contact_email)}`} />}
          >
            Create an Account
          </Button>
        </div>
      )}
    </div>
  );
}
