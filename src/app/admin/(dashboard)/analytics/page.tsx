import type { Metadata } from "next";
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { DateRangeFilter, resolveDateRange } from "@/components/admin/date-range-filter";
import { createClient } from "@/lib/supabase/server";
import { getMostViewedProducts } from "@/lib/queries";
import { formatPrice } from "@/lib/format";
import type { Order, OrderItem, Profile } from "@/lib/types";

export const metadata: Metadata = { title: "Analytics" };

function daysBetween(fromIso: string, toIso: string): { key: string; label: string }[] {
  const from = new Date(fromIso);
  const to = new Date(toIso);
  const days = Math.max(1, Math.min(90, Math.round((to.getTime() - from.getTime()) / 86400000) + 1));
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    return {
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
  });
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const range = resolveDateRange(params.range, params.from, params.to);
  const supabase = await createClient();
  const [{ data: orders }, { data: orderItems }, { data: customers }, mostViewed] = await Promise.all([
    supabase.from("orders").select("*").gte("created_at", range.from).lte("created_at", range.to),
    supabase.from("order_items").select("*"),
    supabase.from("profiles").select("*").gte("created_at", range.from).lte("created_at", range.to),
    getMostViewedProducts(5),
  ]);

  const allOrders = (orders ?? []) as Order[];
  const allItems = (orderItems ?? []) as OrderItem[];
  const allCustomers = (customers ?? []) as Profile[];

  const [{ data: allViewRows }, { count: allTimeOrderCount }] = await Promise.all([
    supabase.from("products").select("view_count"),
    supabase.from("orders").select("id", { count: "exact", head: true }),
  ]);
  const totalViews = (allViewRows ?? []).reduce((sum, p) => sum + Number(p.view_count ?? 0), 0);
  const conversionRate = totalViews > 0 ? ((allTimeOrderCount ?? 0) / totalViews) * 100 : 0;

  const totalRevenue = allOrders.reduce((sum, o) => sum + Number(o.total ?? 0), 0);
  const avgOrderValue = allOrders.length > 0 ? totalRevenue / allOrders.length : 0;

  const days = daysBetween(range.from, range.to);
  const revenueByDay = days.map(({ key, label }) => ({
    label,
    value: allOrders.filter((o) => o.created_at.slice(0, 10) === key).reduce((sum, o) => sum + Number(o.total ?? 0), 0),
  }));
  const ordersByDay = days.map(({ key, label }) => ({
    label,
    value: allOrders.filter((o) => o.created_at.slice(0, 10) === key).length,
  }));
  const customersByDay = days.map(({ key, label }) => ({
    label,
    value: allCustomers.filter((c) => c.created_at.slice(0, 10) === key).length,
  }));

  const productTotals = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const item of allItems) {
    const existing = productTotals.get(item.product_name) ?? { name: item.product_name, qty: 0, revenue: 0 };
    existing.qty += item.quantity;
    existing.revenue += item.subtotal;
    productTotals.set(item.product_name, existing);
  }
  const topProducts = Array.from(productTotals.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Store performance overview</p>
        </div>
        <DateRangeFilter />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard icon={DollarSign} label="Revenue" value={formatPrice(totalRevenue)} />
        <StatCard icon={ShoppingCart} label="Orders" value={String(allOrders.length)} />
        <StatCard icon={TrendingUp} label="Avg. Order Value" value={formatPrice(avgOrderValue)} />
        <StatCard icon={Package} label="Items Sold" value={String(allItems.reduce((s, i) => s + i.quantity, 0))} />
        <StatCard
          icon={TrendingUp}
          label="Conversion Rate (All-Time)"
          value={totalViews > 0 ? `${conversionRate.toFixed(1)}%` : "—"}
        />
      </div>

      <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
        <h2 className="font-display text-lg font-semibold">Revenue</h2>
        <div className="mt-6">
          <RevenueChart data={revenueByDay} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
          <h2 className="font-display text-lg font-semibold">Orders</h2>
          <div className="mt-6">
            <RevenueChart data={ordersByDay} valueLabel="Orders" formatValue={(n) => String(n)} />
          </div>
        </div>
        <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
          <h2 className="font-display text-lg font-semibold">New Customers</h2>
          <div className="mt-6">
            <RevenueChart data={customersByDay} valueLabel="Customers" formatValue={(n) => String(n)} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
          <h2 className="font-display text-lg font-semibold">Best-Selling Products</h2>
          <p className="text-xs text-muted-foreground">In the selected date range</p>
          <div className="mt-4 flex flex-col gap-3">
            {topProducts.length === 0 && <p className="text-sm text-muted-foreground">No sales data yet.</p>}
            {topProducts.map((product, i) => (
              <div key={product.name} className="flex items-center gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm font-medium">{product.name}</span>
                <span className="text-xs text-muted-foreground">{product.qty} sold</span>
                <span className="text-sm font-semibold">{formatPrice(product.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
          <h2 className="font-display text-lg font-semibold">Most Viewed Products</h2>
          <p className="text-xs text-muted-foreground">All-time</p>
          <div className="mt-4 flex flex-col gap-3">
            {mostViewed.length === 0 && <p className="text-sm text-muted-foreground">No product views yet.</p>}
            {mostViewed.map((product, i) => (
              <div key={product.id} className="flex items-center gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
                  {i + 1}
                </span>
                <span className="flex-1 truncate text-sm font-medium">{product.name}</span>
                <span className="text-xs text-muted-foreground">{product.view_count} views</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
