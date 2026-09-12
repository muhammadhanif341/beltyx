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
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatOrderNumber, formatPrice } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Orders" };

const STATUS_VARIANT: Record<OrderStatus, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "secondary",
  processing: "outline",
  shipped: "outline",
  delivered: "default",
  cancelled: "destructive",
};

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
  const orders = (data ?? []) as Order[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">{orders.length} orders</p>
      </div>

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
                  {order.payment_method.replace("_", " ")}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[order.status]} className="capitalize">
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">{formatPrice(order.total)}</TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No orders yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
