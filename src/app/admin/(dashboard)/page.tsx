import type { Metadata } from "next";
import Link from "next/link";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, Clock } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { DateRangeFilter, resolveDateRange } from "@/components/admin/date-range-filter";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatOrderNumber, formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS, ORDER_STATUS_VARIANT, type Order } from "@/lib/types";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const range = resolveDateRange(params.range, params.from, params.to);
  const supabase = await createClient();

  const [
    { count: productCount },
    { count: orderCount },
    { count: customerCount },
    { count: pendingCount },
    { data: recentOrders },
    { data: revenueRows },
    { data: lowStockProducts },
  ] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }).gte("created_at", range.from).lte("created_at", range.to),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase.from("orders").select("total").gte("created_at", range.from).lte("created_at", range.to),
    supabase.from("products").select("id, stock, low_stock_threshold").order("stock", { ascending: true }),
  ]);

  const totalRevenue = (revenueRows ?? []).reduce((sum, r) => sum + Number(r.total ?? 0), 0);
  const lowStockCount = (lowStockProducts ?? []).filter((p) => p.stock <= p.low_stock_threshold).length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Store overview</p>
        </div>
        <DateRangeFilter />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={DollarSign} label="Total Sales" value={formatPrice(totalRevenue)} />
        <StatCard icon={ShoppingCart} label="Total Orders" value={String(orderCount ?? 0)} />
        <StatCard icon={Users} label="Total Customers" value={String(customerCount ?? 0)} />
        <StatCard icon={Package} label="Total Products" value={String(productCount ?? 0)} />
        <StatCard icon={Clock} label="Pending Orders" value={String(pendingCount ?? 0)} />
        <StatCard icon={AlertTriangle} label="Low Stock Products" value={String(lowStockCount)} />
      </div>

      <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-accent hover:underline">
            View all
          </Link>
        </div>

        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {((recentOrders ?? []) as Order[]).map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Link href={`/admin/orders/${order.id}`} className="font-medium hover:text-accent">
                    {formatOrderNumber(order.id)}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(order.created_at)}</TableCell>
                <TableCell>
                  <Badge variant={ORDER_STATUS_VARIANT[order.status]}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">{formatPrice(order.total)}</TableCell>
              </TableRow>
            ))}
            {(recentOrders ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
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
