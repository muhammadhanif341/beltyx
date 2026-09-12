import type { Metadata } from "next";
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import type { Order, OrderItem } from "@/lib/types";

export const metadata: Metadata = { title: "Analytics" };

function lastNDays(n: number): { key: string; label: string }[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return {
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
  });
}

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();
  const [{ data: orders }, { data: orderItems }] = await Promise.all([
    supabase.from("orders").select("*"),
    supabase.from("order_items").select("*"),
  ]);

  const allOrders = (orders ?? []) as Order[];
  const allItems = (orderItems ?? []) as OrderItem[];

  const totalRevenue = allOrders.reduce((sum, o) => sum + Number(o.total ?? 0), 0);
  const avgOrderValue = allOrders.length > 0 ? totalRevenue / allOrders.length : 0;

  const days = lastNDays(14);
  const revenueByDay = days.map(({ key, label }) => {
    const value = allOrders
      .filter((o) => o.created_at.slice(0, 10) === key)
      .reduce((sum, o) => sum + Number(o.total ?? 0), 0);
    return { label, value };
  });

  const productTotals = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const item of allItems) {
    const existing = productTotals.get(item.product_name) ?? { name: item.product_name, qty: 0, revenue: 0 };
    existing.qty += item.quantity;
    existing.revenue += item.subtotal;
    productTotals.set(item.product_name, existing);
  }
  const topProducts = Array.from(productTotals.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Store performance overview</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={DollarSign} label="Total Revenue" value={formatPrice(totalRevenue)} />
        <StatCard icon={ShoppingCart} label="Total Orders" value={String(allOrders.length)} />
        <StatCard icon={TrendingUp} label="Avg. Order Value" value={formatPrice(avgOrderValue)} />
        <StatCard icon={Package} label="Items Sold" value={String(allItems.reduce((s, i) => s + i.quantity, 0))} />
      </div>

      <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
        <h2 className="font-display text-lg font-semibold">Revenue — Last 14 Days</h2>
        <div className="mt-6">
          <RevenueChart data={revenueByDay} />
        </div>
      </div>

      <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
        <h2 className="font-display text-lg font-semibold">Top Products by Revenue</h2>
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
    </div>
  );
}
