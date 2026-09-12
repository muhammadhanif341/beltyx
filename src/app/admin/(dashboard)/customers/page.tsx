import type { Metadata } from "next";
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
import { formatDate, formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Customers" };

interface CustomerRow {
  id: string;
  email: string | null;
  full_name: string | null;
  is_admin: boolean;
  created_at: string;
  orderCount: number;
  totalSpent: number;
}

export default async function AdminCustomersPage() {
  const supabase = await createClient();
  const [{ data: profiles }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("orders").select("user_id, total"),
  ]);

  const customers: CustomerRow[] = (profiles ?? []).map((p) => {
    const userOrders = (orders ?? []).filter((o) => o.user_id === p.id);
    return {
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      is_admin: p.is_admin,
      created_at: p.created_at,
      orderCount: userOrders.length,
      totalSpent: userOrders.reduce((sum, o) => sum + Number(o.total ?? 0), 0),
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Customers</h1>
        <p className="mt-1 text-sm text-muted-foreground">{customers.length} customers</p>
      </div>

      <div className="rounded-2xl bg-card p-2 ring-1 ring-border sm:p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead className="text-right">Total Spent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">
                  {customer.full_name ?? "—"}
                  {customer.is_admin && (
                    <Badge variant="secondary" className="ml-2">
                      Admin
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{customer.email ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(customer.created_at)}</TableCell>
                <TableCell>{customer.orderCount}</TableCell>
                <TableCell className="text-right font-medium">{formatPrice(customer.totalSpent)}</TableCell>
              </TableRow>
            ))}
            {customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No customers yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
