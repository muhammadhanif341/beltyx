"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { couponFormSchema, type CouponFormInput, type CouponFormRaw } from "@/lib/validations/admin";
import type { Coupon } from "@/lib/types";
import { toast } from "sonner";

export function CouponFormDialog({ coupon }: { coupon?: Coupon }) {
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const router = useRouter();
  const isEdit = Boolean(coupon);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CouponFormRaw, unknown, CouponFormInput>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: coupon?.code ?? "",
      description: coupon?.description ?? "",
      discountType: coupon?.discount_type ?? "percent",
      discountValue: coupon?.discount_value ?? 10,
      minOrderAmount: coupon?.min_order_amount ?? 0,
      isActive: coupon?.is_active ?? true,
    },
  });

  async function onSubmit(data: CouponFormInput) {
    setSubmitting(true);
    const supabase = createClient();
    const payload = {
      code: data.code.toUpperCase(),
      description: data.description || null,
      discount_type: data.discountType,
      discount_value: data.discountValue,
      min_order_amount: data.minOrderAmount,
      is_active: data.isActive,
    };

    const { error } = isEdit
      ? await supabase.from("coupons").update(payload).eq("id", coupon!.id)
      : await supabase.from("coupons").insert(payload);

    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(isEdit ? "Coupon updated" : "Coupon created");
    setOpen(false);
    reset();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Coupon" : "Add Coupon"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="code">Code</Label>
            <Input id="code" className="mt-1.5 uppercase" {...register("code")} />
            {errors.code && <p className="mt-1 text-xs text-destructive">{errors.code.message}</p>}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" className="mt-1.5" {...register("description")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Discount Type</Label>
              <Select
                value={watch("discountType")}
                onValueChange={(v) => setValue("discountType", v as CouponFormInput["discountType"])}
              >
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Percent (%)</SelectItem>
                  <SelectItem value="fixed">Fixed ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="discountValue">Value</Label>
              <Input id="discountValue" type="number" step="0.01" className="mt-1.5" {...register("discountValue")} />
            </div>
          </div>
          <div>
            <Label htmlFor="minOrderAmount">Minimum Order Amount ($)</Label>
            <Input id="minOrderAmount" type="number" step="0.01" className="mt-1.5" {...register("minOrderAmount")} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={watch("isActive")} onCheckedChange={(v) => setValue("isActive", Boolean(v))} />
            Active
          </label>
          <DialogFooter>
            <Button type="submit" variant="hero" disabled={submitting}>
              {submitting ? "Saving..." : isEdit ? "Save Changes" : "Create Coupon"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      <DialogTrigger render={isEdit ? <Button variant="ghost" size="icon-sm" /> : <Button variant="hero" />}>
        {isEdit ? (
          <Pencil className="size-3.5" />
        ) : (
          <>
            <Plus className="size-4" data-icon="inline-start" />
            Add Coupon
          </>
        )}
      </DialogTrigger>
    </Dialog>
  );
}
