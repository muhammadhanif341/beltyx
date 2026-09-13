import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard } from "@/components/admin/stat-card";
import { DollarSign, Package, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatOrderNumber, formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS, ORDER_STATUS_VARIANT, type Order } from "@/lib/types";

export const metadata: Metadata = { title: "Customer" };

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
    supabase.from("orders").select("*").eq("user_id", id).order("created_at", { ascending: false }),
  ]);

  if (!profile) notFound();

  const customerOrders = (orders ?? []) as Order[];
  const totalSpent = customerOrders.reduce((sum, o) => sum + Number(o.total ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2" render={<Link href="/admin/customers" />}>
          <ArrowLeft className="size-4" />
          Back to Customers
        </Button>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-semibold">{profile.full_name ?? "Unnamed customer"}</h1>
          {profile.is_admin && <Badge variant="secondary">Admin</Badge>}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {profile.email ?? "—"} {profile.phone && <>&middot; {profile.phone}</>}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Package} label="Orders" value={String(customerOrders.length)} />
        <StatCard icon={DollarSign} label="Total Spent" value={formatPrice(totalSpent)} />
        <StatCard icon={Calendar} label="Customer Since" value={formatDate(profile.created_at)} />
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold">Order History</h2>
        <div className="mt-3 rounded-2xl bg-card p-2 ring-1 ring-border sm:p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link href={`/admin/orders/${order.id}`} className="font-medium hover:text-accent">
                      {formatOrderNumber(order.id)}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(order.created_at)}</TableCell>
                  <TableCell className="text-muted-foreground capitalize">
                    {order.payment_method.replace("_", " ")} &middot; {order.payment_status}
                  </TableCell>
                  <TableCell>
                    <Badge variant={ORDER_STATUS_VARIANT[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatPrice(order.total)}</TableCell>
                </TableRow>
              ))}
              {customerOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No orders yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
