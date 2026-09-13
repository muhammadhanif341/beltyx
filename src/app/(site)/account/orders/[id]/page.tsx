import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SignInPrompt } from "@/components/site/sign-in-prompt";
import { OrderTimeline } from "@/components/site/order-timeline";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatOrderNumber, formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS, ORDER_STATUS_VARIANT, type Order, type OrderItem, type OrderStatusHistoryEntry } from "@/lib/types";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return <SignInPrompt next="/account/orders" />;

  const { id } = await params;
  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!order) notFound();

  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", id);
  const { data: history } = await supabase
    .from("order_status_history")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: true });
  const orderTyped = order as Order;

  return (
    <div>
      <Link href="/account/orders" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent">
        <ArrowLeft className="size-4" />
        Back to Orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold">{formatOrderNumber(orderTyped.id)}</h2>
          <p className="text-sm text-muted-foreground">Placed on {formatDate(orderTyped.created_at)}</p>
        </div>
        <Badge variant={ORDER_STATUS_VARIANT[orderTyped.status]} className="text-sm">
          {ORDER_STATUS_LABELS[orderTyped.status]}
        </Badge>
      </div>

      <div className="mt-6 rounded-2xl bg-card p-6 ring-1 ring-border">
        <OrderTimeline status={orderTyped.status} history={(history ?? []) as OrderStatusHistoryEntry[]} />
      </div>

      <div className="mt-6 rounded-3xl bg-card p-6 ring-1 ring-border">
        <div className="flex flex-col gap-3">
          {((items ?? []) as OrderItem[]).map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                {item.image_url && (
                  <Image src={item.image_url} alt={item.product_name} fill sizes="64px" className="object-cover" />
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
            <span>{formatPrice(orderTyped.subtotal)}</span>
          </div>
          {orderTyped.discount > 0 && (
            <div className="flex justify-between text-accent">
              <span>Discount</span>
              <span>-{formatPrice(orderTyped.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{orderTyped.shipping_fee === 0 ? "Free" : formatPrice(orderTyped.shipping_fee)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-3 font-display text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(orderTyped.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
          <p className="text-sm font-semibold">Shipping Address</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {orderTyped.shipping_address.full_name}
            <br />
            {orderTyped.shipping_address.line1}
            {orderTyped.shipping_address.line2 ? `, ${orderTyped.shipping_address.line2}` : ""}
            <br />
            {orderTyped.shipping_address.city}, {orderTyped.shipping_address.country}
            <br />
            {orderTyped.shipping_address.phone}
          </p>
        </div>
        <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
          <p className="text-sm font-semibold">Payment</p>
          <p className="mt-2 text-sm text-muted-foreground capitalize">
            {orderTyped.payment_method.replace("_", " ")} &middot; {orderTyped.payment_status}
          </p>
          {orderTyped.estimated_delivery && (
            <p className="mt-2 text-sm text-muted-foreground">
              Estimated delivery: {formatDate(orderTyped.estimated_delivery)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
