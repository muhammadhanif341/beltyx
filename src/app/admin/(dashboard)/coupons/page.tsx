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
import { CouponFormDialog } from "@/components/admin/coupon-form-dialog";
import { CouponDeleteButton } from "@/components/admin/coupon-delete-button";
import { createClient } from "@/lib/supabase/server";
import type { Coupon } from "@/lib/types";

export const metadata: Metadata = { title: "Coupons" };

export default async function AdminCouponsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
  const coupons = (data ?? []) as Coupon[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Coupons</h1>
          <p className="mt-1 text-sm text-muted-foreground">{coupons.length} coupons</p>
        </div>
        <CouponFormDialog />
      </div>

      <div className="rounded-2xl bg-card p-2 ring-1 ring-border sm:p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Min. Order</TableHead>
              <TableHead>Used</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                <TableCell className="text-muted-foreground">
                  {coupon.discount_type === "percent" ? `${coupon.discount_value}%` : `$${coupon.discount_value}`}
                </TableCell>
                <TableCell className="text-muted-foreground">${coupon.min_order_amount}</TableCell>
                <TableCell className="text-muted-foreground">{coupon.used_count}</TableCell>
                <TableCell>
                  <Badge variant={coupon.is_active ? "default" : "secondary"}>
                    {coupon.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="flex justify-end gap-1">
                  <CouponFormDialog coupon={coupon} />
                  <CouponDeleteButton couponId={coupon.id} />
                </TableCell>
              </TableRow>
            ))}
            {coupons.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No coupons yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
