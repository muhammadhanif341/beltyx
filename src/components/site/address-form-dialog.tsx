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
import { createClient } from "@/lib/supabase/client";
import { addressSchema, type AddressInput } from "@/lib/validations/account";
import type { Address } from "@/lib/types";
import { toast } from "sonner";

export function AddressFormDialog({ address, userId }: { address?: Address; userId: string }) {
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const router = useRouter();
  const isEdit = Boolean(address);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: address?.full_name ?? "",
      phone: address?.phone ?? "",
      line1: address?.line1 ?? "",
      line2: address?.line2 ?? "",
      city: address?.city ?? "",
      state: address?.state ?? "",
      postalCode: address?.postal_code ?? "",
      country: address?.country ?? "Pakistan",
      isDefault: address?.is_default ?? false,
    },
  });

  async function onSubmit(data: AddressInput) {
    setSubmitting(true);
    const supabase = createClient();
    const payload = {
      user_id: userId,
      full_name: data.fullName,
      phone: data.phone,
      line1: data.line1,
      line2: data.line2 || null,
      city: data.city,
      state: data.state || null,
      postal_code: data.postalCode,
      country: data.country,
      is_default: data.isDefault,
    };

    const { error } = isEdit
      ? await supabase.from("addresses").update(payload).eq("id", address!.id)
      : await supabase.from("addresses").insert(payload);

    setSubmitting(false);
    if (error) {
      toast.error("Couldn't save this address. Try again.");
      return;
    }
    toast.success(isEdit ? "Address updated" : "Address added");
    setOpen(false);
    reset();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Address" : "Add Address"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" className="mt-1.5" {...register("fullName")} />
              {errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName.message}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" className="mt-1.5" {...register("phone")} />
              {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="line1">Address</Label>
              <Input id="line1" className="mt-1.5" {...register("line1")} />
              {errors.line1 && <p className="mt-1 text-xs text-destructive">{errors.line1.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="line2">Apartment, suite, etc. (optional)</Label>
              <Input id="line2" className="mt-1.5" {...register("line2")} />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" className="mt-1.5" {...register("city")} />
              {errors.city && <p className="mt-1 text-xs text-destructive">{errors.city.message}</p>}
            </div>
            <div>
              <Label htmlFor="state">State / Province</Label>
              <Input id="state" className="mt-1.5" {...register("state")} />
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input id="postalCode" className="mt-1.5" {...register("postalCode")} />
              {errors.postalCode && <p className="mt-1 text-xs text-destructive">{errors.postalCode.message}</p>}
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" className="mt-1.5" {...register("country")} />
              {errors.country && <p className="mt-1 text-xs text-destructive">{errors.country.message}</p>}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={watch("isDefault")} onCheckedChange={(v) => setValue("isDefault", Boolean(v))} />
            Set as default address
          </label>
          <DialogFooter>
            <Button type="submit" variant="hero" disabled={submitting}>
              {submitting ? "Saving..." : isEdit ? "Save Changes" : "Add Address"}
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
            Add Address
          </>
        )}
      </DialogTrigger>
    </Dialog>
  );
}
