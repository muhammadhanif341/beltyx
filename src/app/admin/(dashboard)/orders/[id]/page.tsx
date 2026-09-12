import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatOrderNumber, formatPrice } from "@/lib/format";
import type { Order, OrderItem } from "@/lib/types";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: order } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (!order) notFound();

  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", id);
  const orderTyped = order as Order;

  return (
    <div>
      <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent">
        <ArrowLeft className="size-4" />
        Back to Orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">{formatOrderNumber(orderTyped.id)}</h1>
          <p className="text-sm text-muted-foreground">Placed on {formatDate(orderTyped.created_at)}</p>
        </div>
        <OrderStatusSelect orderId={orderTyped.id} status={orderTyped.status} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
          <h2 className="font-display text-lg font-semibold">Items</h2>
          <div className="mt-4 flex flex-col gap-3">
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
              <span>{formatPrice(orderTyped.subtotal)}</span>
            </div>
            {orderTyped.discount > 0 && (
              <div className="flex justify-between text-accent">
                <span>Discount ({orderTyped.coupon_code})</span>
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

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
            <p className="text-sm font-semibold">Customer</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {orderTyped.shipping_address.full_name}
              <br />
              {orderTyped.contact_email}
              <br />
              {orderTyped.shipping_address.phone}
            </p>
          </div>
          <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
            <p className="text-sm font-semibold">Shipping Address</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {orderTyped.shipping_address.line1}
              {orderTyped.shipping_address.line2 ? `, ${orderTyped.shipping_address.line2}` : ""}
              <br />
              {orderTyped.shipping_address.city}, {orderTyped.shipping_address.country}
            </p>
          </div>
          <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
            <p className="text-sm font-semibold">Payment</p>
            <p className="mt-2 text-sm text-muted-foreground capitalize">
              {orderTyped.payment_method.replace("_", " ")} &middot; {orderTyped.payment_status}
            </p>
          </div>
          {orderTyped.notes && (
            <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
              <p className="text-sm font-semibold">Notes</p>
              <p className="mt-2 text-sm text-muted-foreground">{orderTyped.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
