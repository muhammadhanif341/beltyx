import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderFilters } from "@/components/admin/order-filters";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatOrderNumber, formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS, ORDER_STATUS_VARIANT, type Order, type OrderStatus, type PaymentStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Orders" };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (params.status) query = query.eq("status", params.status as OrderStatus);
  if (params.paymentStatus) query = query.eq("payment_status", params.paymentStatus as PaymentStatus);
  if (params.from) query = query.gte("created_at", `${params.from}T00:00:00`);
  if (params.to) query = query.lte("created_at", `${params.to}T23:59:59`);

  const { data } = await query;
  let orders = (data ?? []) as Order[];

  if (params.q) {
    const q = params.q.toLowerCase();
    orders = orders.filter(
      (o) =>
        formatOrderNumber(o.id).toLowerCase().includes(q) ||
        o.shipping_address.full_name.toLowerCase().includes(q) ||
        o.contact_email.toLowerCase().includes(q),
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">{orders.length} orders</p>
      </div>

      <OrderFilters />

      <div className="rounded-2xl bg-card p-2 ring-1 ring-border sm:p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Link href={`/admin/orders/${order.id}`} className="font-medium hover:text-accent">
                    {formatOrderNumber(order.id)}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{order.shipping_address.full_name}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(order.created_at)}</TableCell>
                <TableCell className="text-muted-foreground capitalize">
                  {order.payment_method.replace("_", " ")} &middot; {order.payment_status}
                </TableCell>
                <TableCell>
                  <Badge variant={ORDER_STATUS_VARIANT[order.status]}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">{formatPrice(order.total)}</TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No orders match these filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
