"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Banknote, Check, CreditCard, Smartphone, Truck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "cn";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/lib/store/cart-store";
import { createOrder, checkCoupon } from "@/lib/actions/checkout";
import { computeShippingFee, formatEstimatedDelivery } from "@/lib/shipping";
import { getPaymentOptions, type PaymentOption } from "@/lib/actions/payments";
import { CHECKOUT_STEPS, CHECKOUT_STEP_FIELDS, checkoutSchema, type CheckoutInput } from "@/lib/validations/checkout";
import { toast } from "sonner";

const PAYMENT_ICONS: Record<string, React.ElementType> = {
  cod: Truck,
  bank_transfer: Banknote,
  card_mock: CreditCard,
  stripe: CreditCard,
  jazzcash: Smartphone,
  easypaisa: Smartphone,
};

export function CheckoutForm({ defaultEmail }: { defaultEmail?: string }) {
  const { lines, couponCode, clear } = useCartStore();
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [submitting, setSubmitting] = React.useState(false);
  const [discount, setDiscount] = React.useState(0);
  const [paymentOptions, setPaymentOptions] = React.useState<PaymentOption[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: defaultEmail ?? "",
      country: "Pakistan",
      shippingMethod: "standard",
      paymentMethod: "",
    },
  });

  React.useEffect(() => {
    getPaymentOptions().then((options) => {
      setPaymentOptions(options);
      if (options.length > 0 && !getValues("paymentMethod")) {
        setValue("paymentMethod", options[0].id);
      }
    });
  }, [getValues, setValue]);

  const shippingMethod = watch("shippingMethod");
  const paymentMethod = watch("paymentMethod");
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

  React.useEffect(() => {
    if (!couponCode) {
      setDiscount(0);
      return;
    }
    let cancelled = false;
    checkCoupon(couponCode, subtotal, lines.map((l) => l.productId)).then((result) => {
      if (!cancelled) setDiscount(result.ok ? result.discount : 0);
    });
    return () => {
      cancelled = true;
    };
  }, [couponCode, subtotal, lines]);

  const shippingFee = computeShippingFee(shippingMethod, subtotal - discount);
  const total = Math.max(0, subtotal - discount + shippingFee);

  async function goNext() {
    const valid = await trigger(CHECKOUT_STEP_FIELDS[step]);
    if (!valid) return;
    setStep((s) => Math.min(5, s + 1));
  }

  function goBack() {
    setStep((s) => Math.max(1, s - 1));
  }

  async function onSubmit(data: CheckoutInput) {
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
      shippingMethod: data.shippingMethod,
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

  const values = getValues();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
      <div className="flex flex-col gap-8">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-3 text-xs">
          {CHECKOUT_STEPS.map((s, i) => (
            <li key={s.id} className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                  s.id < step
                    ? "gold-gradient text-[#241a12]"
                    : s.id === step
                      ? "bg-accent/15 text-accent ring-1 ring-accent"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {s.id < step ? <Check className="size-3.5" /> : s.id}
              </span>
              <span className={cn("hidden sm:inline", s.id === step ? "font-semibold text-foreground" : "text-muted-foreground")}>
                {s.title}
              </span>
              {i < CHECKOUT_STEPS.length - 1 && <span className="mx-1 h-px w-4 bg-border sm:w-6" />}
            </li>
          ))}
        </ol>

        {step === 1 && (
          <section>
            <h2 className="font-display text-xl font-semibold">Customer Information</h2>
            <p className="mt-1 text-sm text-muted-foreground">We&apos;ll send your order confirmation here.</p>
            <div className="mt-4">
              <Field label="Email" error={errors.email?.message}>
                <Input type="email" {...register("email")} placeholder="you@example.com" />
              </Field>
            </div>
          </section>
        )}

        {step === 2 && (
          <section>
            <h2 className="font-display text-xl font-semibold">Shipping Address</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full Name" error={errors.fullName?.message} className="sm:col-span-2">
                <Input {...register("fullName")} placeholder="Jane Doe" />
              </Field>
              <Field label="Phone" error={errors.phone?.message}>
                <Input {...register("phone")} placeholder="+92 300 1234567" />
              </Field>
              <Field label="Country" error={errors.country?.message}>
                <Input {...register("country")} />
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
              <Field label="Province / State">
                <Input {...register("state")} />
              </Field>
              <Field label="Postal Code" error={errors.postalCode?.message}>
                <Input {...register("postalCode")} />
              </Field>
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <h2 className="font-display text-xl font-semibold">Shipping Method</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ShippingOption
                icon={Truck}
                title="Standard"
                description={`Arrives by ${formatEstimatedDelivery("standard")}`}
                price={computeShippingFee("standard", subtotal - discount)}
                selected={shippingMethod === "standard"}
                onSelect={() => setValue("shippingMethod", "standard")}
              />
              <ShippingOption
                icon={Zap}
                title="Express"
                description={`Arrives by ${formatEstimatedDelivery("express")}`}
                price={computeShippingFee("express", subtotal - discount)}
                selected={shippingMethod === "express"}
                onSelect={() => setValue("shippingMethod", "express")}
              />
            </div>
          </section>
        )}

        {step === 4 && (
          <section>
            <h2 className="font-display text-xl font-semibold">Payment</h2>
            {errors.paymentMethod && <p className="mt-1 text-xs text-destructive">{errors.paymentMethod.message}</p>}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {paymentOptions.map((option) => {
                const Icon = PAYMENT_ICONS[option.id] ?? CreditCard;
                return (
                  <label
                    key={option.id}
                    onClick={() => setValue("paymentMethod", option.id)}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors",
                      paymentMethod === option.id ? "border-accent bg-accent/5" : "border-border",
                    )}
                  >
                    <input type="radio" className="sr-only" checked={paymentMethod === option.id} readOnly />
                    <Icon className="size-5 shrink-0 text-accent" />
                    <div>
                      <p className="text-sm font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </label>
                );
              })}
              {paymentOptions.length === 0 && (
                <p className="text-sm text-muted-foreground">Loading payment options…</p>
              )}
            </div>
          </section>
        )}

        {step === 5 && (
          <section className="flex flex-col gap-5">
            <h2 className="font-display text-xl font-semibold">Order Review</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ReviewBlock title="Contact" onEdit={() => setStep(1)}>
                {values.email}
              </ReviewBlock>
              <ReviewBlock title="Ship To" onEdit={() => setStep(2)}>
                {values.fullName} &middot; {values.phone}
                <br />
                {values.line1}
                {values.line2 ? `, ${values.line2}` : ""}, {values.city}
                {values.state ? `, ${values.state}` : ""} {values.postalCode}, {values.country}
              </ReviewBlock>
              <ReviewBlock title="Shipping Method" onEdit={() => setStep(3)}>
                {shippingMethod === "express" ? "Express" : "Standard"} — arrives by{" "}
                {formatEstimatedDelivery(shippingMethod)}
              </ReviewBlock>
              <ReviewBlock title="Payment" onEdit={() => setStep(4)}>
                {paymentOptions.find((o) => o.id === paymentMethod)?.label ?? "—"}
              </ReviewBlock>
            </div>
            <div>
              <Label htmlFor="notes">Order Notes (optional)</Label>
              <Textarea id="notes" {...register("notes")} className="mt-2" rows={3} />
            </div>
          </section>
        )}

        <div className="flex items-center justify-between border-t border-border pt-6">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={goBack}>
              Back
            </Button>
          ) : (
            <span />
          )}
          {step < 5 ? (
            <Button type="button" variant="hero" onClick={goNext}>
              Continue
            </Button>
          ) : (
            <Button type="submit" size="xl" variant="hero" disabled={submitting}>
              {submitting ? "Placing Order..." : "Place Order"}
            </Button>
          )}
        </div>
        {step === 5 && (
          <p className="text-center text-xs text-muted-foreground">
            By placing your order you agree to our{" "}
            <Link href="/terms" className="underline">Terms</Link> &amp;{" "}
            <Link href="/privacy-policy" className="underline">Privacy Policy</Link>.
          </p>
        )}
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
          {discount > 0 && (
            <div className="flex justify-between text-accent">
              <span>Discount{couponCode ? ` (${couponCode})` : ""}</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{shippingFee === 0 ? "Free" : formatPrice(shippingFee)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-3 font-display text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
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

function ShippingOption({
  icon: Icon,
  title,
  description,
  price,
  selected,
  onSelect,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  price: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      onClick={onSelect}
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors",
        selected ? "border-accent bg-accent/5" : "border-border",
      )}
    >
      <input type="radio" className="sr-only" checked={selected} readOnly />
      <Icon className="size-5 shrink-0 text-accent" />
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <span className="text-sm font-semibold">{price === 0 ? "Free" : formatPrice(price)}</span>
    </label>
  );
}

function ReviewBlock({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{title}</p>
        <button type="button" onClick={onEdit} className="text-xs text-accent hover:underline">
          Edit
        </button>
      </div>
      <p className="mt-1.5 text-sm">{children}</p>
    </div>
  );
}
