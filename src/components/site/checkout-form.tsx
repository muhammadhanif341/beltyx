"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Truck, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "cn";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/lib/store/cart-store";
import { createOrder } from "@/lib/actions/checkout";
import { shippingAddressSchema, type ShippingAddressInput } from "@/lib/validations/checkout";
import { toast } from "sonner";

const FREE_SHIPPING_THRESHOLD = 75;
const SHIPPING_FEE = 8;

export function CheckoutForm({ defaultEmail }: { defaultEmail?: string }) {
  const { lines, couponCode, clear } = useCartStore();
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ShippingAddressInput>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      email: defaultEmail ?? "",
      country: "Pakistan",
      paymentMethod: "cod",
    },
  });

  const paymentMethod = watch("paymentMethod");
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = Math.max(0, subtotal + shippingFee);

  async function onSubmit(data: ShippingAddressInput) {
    if (lines.length === 0) {
      toast.error("Your bag is empty.");
      return;
    }
    setSubmitting(true);
    const result = await createOrder({
      lines: lines.map((l) => ({
        productId: l.productId,
        variantId: l.variantId,
        name: l.name,
        variantLabel: l.variantLabel,
        unitPrice: l.unitPrice,
        quantity: l.quantity,
        image: l.image,
      })),
      shippingAddress: {
        full_name: data.fullName,
        phone: data.phone,
        line1: data.line1,
        line2: data.line2,
        city: data.city,
        state: data.state,
        postal_code: data.postalCode,
        country: data.country,
      },
      contactEmail: data.email,
      paymentMethod: data.paymentMethod,
      notes: data.notes,
      couponCode: couponCode,
    });
    setSubmitting(false);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    clear();
    router.push(`/order-success/${result.orderId}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
      <div className="flex flex-col gap-8">
        <section>
          <h2 className="font-display text-xl font-semibold">Contact & Shipping</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Full Name" error={errors.fullName?.message} className="sm:col-span-2">
              <Input {...register("fullName")} placeholder="Jane Doe" />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <Input type="email" {...register("email")} placeholder="you@example.com" />
            </Field>
            <Field label="Phone" error={errors.phone?.message}>
              <Input {...register("phone")} placeholder="+92 300 1234567" />
            </Field>
            <Field label="Address" error={errors.line1?.message} className="sm:col-span-2">
              <Input {...register("line1")} placeholder="Street address" />
            </Field>
            <Field label="Apartment, suite, etc. (optional)" className="sm:col-span-2">
              <Input {...register("line2")} />
            </Field>
            <Field label="City" error={errors.city?.message}>
              <Input {...register("city")} />
            </Field>
            <Field label="State / Province">
              <Input {...register("state")} />
            </Field>
            <Field label="Postal Code" error={errors.postalCode?.message}>
              <Input {...register("postalCode")} />
            </Field>
            <Field label="Country" error={errors.country?.message}>
              <Input {...register("country")} />
            </Field>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">Payment Method</h2>
          <RadioGroup
            value={paymentMethod}
            onValueChange={(v) => setValue("paymentMethod", v as "cod" | "bank_transfer")}
            className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            <label
              onClick={() => setValue("paymentMethod", "cod")}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors",
                paymentMethod === "cod" ? "border-accent bg-accent/5" : "border-border",
              )}
            >
              <RadioGroupItem value="cod" />
              <Truck className="size-5 text-accent" />
              <div>
                <p className="text-sm font-medium">Cash on Delivery</p>
                <p className="text-xs text-muted-foreground">Pay when your order arrives</p>
              </div>
            </label>
            <label
              onClick={() => setValue("paymentMethod", "bank_transfer")}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors",
                paymentMethod === "bank_transfer" ? "border-accent bg-accent/5" : "border-border",
              )}
            >
              <RadioGroupItem value="bank_transfer" />
              <Banknote className="size-5 text-accent" />
              <div>
                <p className="text-sm font-medium">Bank Transfer</p>
                <p className="text-xs text-muted-foreground">Details sent after checkout</p>
              </div>
            </label>
          </RadioGroup>
        </section>

        <section>
          <Label htmlFor="notes">Order Notes (optional)</Label>
          <Textarea id="notes" {...register("notes")} className="mt-2" rows={3} />
        </section>
      </div>

      <div className="h-fit rounded-3xl bg-card p-6 ring-1 ring-border lg:sticky lg:top-24">
        <h2 className="font-display text-xl font-semibold">Order Summary</h2>
        <div className="mt-4 flex flex-col gap-3">
          {lines.map((line) => (
            <div key={`${line.productId}-${line.variantId}`} className="flex items-center gap-3">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                {line.image && (
                  <Image src={line.image} alt={line.name} fill sizes="56px" className="object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{line.name}</p>
                <p className="text-xs text-muted-foreground">
                  {line.variantLabel ? `${line.variantLabel} · ` : ""}Qty {line.quantity}
                </p>
              </div>
              <span className="text-sm font-semibold">{formatPrice(line.unitPrice * line.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-2 border-t border-border pt-5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{shippingFee === 0 ? "Free" : formatPrice(shippingFee)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-3 font-display text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        <Button type="submit" size="xl" variant="hero" className="mt-6 w-full" disabled={submitting}>
          {submitting ? "Placing Order..." : "Place Order"}
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          By placing your order you agree to our{" "}
          <Link href="/terms" className="underline">Terms</Link> &amp;{" "}
          <Link href="/privacy-policy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <div className="mt-1.5">{children}</div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
