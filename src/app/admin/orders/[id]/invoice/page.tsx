import { notFound, redirect } from "next/navigation";
import { PrintButton } from "@/components/admin/print-button";
import { getCurrentAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatOrderNumber, formatPrice } from "@/lib/format";
import type { Order, OrderItem } from "@/lib/types";

export default async function AdminOrderInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const { id } = await params;
  const supabase = await createClient();
  const { data: order } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (!order) notFound();

  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", id);
  const orderTyped = order as Order;
  const orderItems = (items ?? []) as OrderItem[];

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 print:px-0 print:py-0">
      <div className="mb-6 flex justify-end print:hidden">
        <PrintButton />
      </div>

      <div className="rounded-2xl bg-card p-8 ring-1 ring-border print:rounded-none print:ring-0">
        <div className="flex items-start justify-between border-b border-border pb-6">
          <div>
            <p className="font-display text-2xl font-semibold">Beltyx</p>
            <p className="text-sm text-muted-foreground">Premium Leather Goods</p>
          </div>
          <div className="text-right">
            <h1 className="font-display text-xl font-semibold">Invoice</h1>
            <p className="text-sm text-muted-foreground">{formatOrderNumber(orderTyped.id)}</p>
            <p className="text-sm text-muted-foreground">{formatDate(orderTyped.created_at)}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="font-semibold">Billed To</p>
            <p className="mt-1 text-muted-foreground">
              {orderTyped.shipping_address.full_name}
              <br />
              {orderTyped.contact_email}
              <br />
              {orderTyped.shipping_address.phone}
            </p>
          </div>
          <div>
            <p className="font-semibold">Ship To</p>
            <p className="mt-1 text-muted-foreground">
              {orderTyped.shipping_address.line1}
              {orderTyped.shipping_address.line2 ? `, ${orderTyped.shipping_address.line2}` : ""}
              <br />
              {orderTyped.shipping_address.city}
              {orderTyped.shipping_address.state ? `, ${orderTyped.shipping_address.state}` : ""}{" "}
              {orderTyped.shipping_address.postal_code}
              <br />
              {orderTyped.shipping_address.country}
            </p>
          </div>
        </div>

        <table className="mt-8 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="py-2 font-medium">Item</th>
              <th className="py-2 text-right font-medium">Qty</th>
              <th className="py-2 text-right font-medium">Price</th>
              <th className="py-2 text-right font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {orderItems.map((item) => (
              <tr key={item.id} className="border-b border-border">
                <td className="py-2">
                  {item.product_name}
                  {item.variant_label && <span className="text-muted-foreground"> · {item.variant_label}</span>}
                </td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">{formatPrice(item.unit_price)}</td>
                <td className="py-2 text-right">{formatPrice(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 ml-auto flex w-full max-w-xs flex-col gap-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(orderTyped.subtotal)}</span>
          </div>
          {orderTyped.discount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount {orderTyped.coupon_code ? `(${orderTyped.coupon_code})` : ""}</span>
              <span>-{formatPrice(orderTyped.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{orderTyped.shipping_fee === 0 ? "Free" : formatPrice(orderTyped.shipping_fee)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 font-display text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(orderTyped.total)}</span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-6 border-t border-border pt-6 text-sm">
          <div>
            <p className="font-semibold">Payment Method</p>
            <p className="mt-1 text-muted-foreground capitalize">{orderTyped.payment_method.replace("_", " ")}</p>
          </div>
          <div>
            <p className="font-semibold">Payment Status</p>
            <p className="mt-1 text-muted-foreground capitalize">{orderTyped.payment_status}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
