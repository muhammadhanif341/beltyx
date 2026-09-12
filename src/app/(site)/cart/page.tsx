"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/lib/store/cart-store";
import { checkCoupon } from "@/lib/actions/checkout";
import { toast } from "sonner";

const FREE_SHIPPING_THRESHOLD = 75;
const SHIPPING_FEE = 8;

export default function CartPage() {
  const { lines, setQuantity, remove, couponCode, applyCoupon } = useCartStore();
  const router = useRouter();
  const [couponInput, setCouponInput] = React.useState(couponCode ?? "");
  const [discount, setDiscount] = React.useState(0);
  const [applying, setApplying] = React.useState(false);

  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const shippingFee = subtotal - discount >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;
  const total = Math.max(0, subtotal - discount + shippingFee);

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setApplying(true);
    const result = await checkCoupon(couponInput.trim(), subtotal);
    setApplying(false);
    if (!result.ok) {
      toast.error(result.message);
      setDiscount(0);
      applyCoupon(null);
      return;
    }
    setDiscount(result.discount);
    applyCoupon(result.code);
    toast.success(`Coupon applied: -${formatPrice(result.discount)}`);
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
        <ShoppingBag className="size-12 text-muted-foreground" />
        <h1 className="mt-6 font-display text-3xl font-semibold">Your bag is empty</h1>
        <p className="mt-2 text-muted-foreground">
          Looks like you haven&apos;t added anything to your bag yet.
        </p>
        <Button variant="hero" size="xl" className="mt-6" render={<Link href="/shop" />}>
          Start Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 pb-32 sm:px-6 lg:px-8 lg:pb-10">
      <h1 className="font-display text-4xl font-semibold">Your Bag</h1>
      <p className="mt-1 text-sm text-muted-foreground">{lines.length} item(s)</p>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-4">
          {lines.map((line) => (
            <div
              key={`${line.productId}-${line.variantId}`}
              className="flex gap-4 rounded-2xl bg-card p-4 ring-1 ring-border"
            >
              <Link href={`/product/${line.slug}`} className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                {line.image && (
                  <Image src={line.image} alt={line.name} fill sizes="96px" className="object-cover" />
                )}
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link href={`/product/${line.slug}`} className="font-display text-lg font-medium hover:text-accent">
                    {line.name}
                  </Link>
                  {line.variantLabel && (
                    <p className="text-xs text-muted-foreground">{line.variantLabel}</p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center rounded-full border border-border">
                    <button
                      type="button"
                      onClick={() => setQuantity(line.productId, line.variantId, line.quantity - 1)}
                      className="flex size-8 items-center justify-center rounded-l-full hover:bg-muted"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm">{line.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(line.productId, line.variantId, line.quantity + 1)}
                      className="flex size-8 items-center justify-center rounded-r-full hover:bg-muted"
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <span className="font-display text-lg font-semibold">
                    {formatPrice(line.unitPrice * line.quantity)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => remove(line.productId, line.variantId)}
                aria-label="Remove item"
                className="self-start text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-3xl bg-card p-6 ring-1 ring-border lg:sticky lg:top-24">
          <h2 className="font-display text-xl font-semibold">Order Summary</h2>

          <div className="mt-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Tag className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Coupon code"
                className="h-10 pl-9"
              />
            </div>
            <Button variant="outline" onClick={handleApplyCoupon} disabled={applying}>
              {applying ? "..." : "Apply"}
            </Button>
          </div>

          <div className="mt-5 space-y-2 border-t border-border pt-5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-accent">
                <span>Discount</span>
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

          <Button
            size="xl"
            variant="hero"
            className="mt-6 hidden w-full lg:inline-flex"
            onClick={() => router.push("/checkout")}
          >
            Proceed to Checkout
          </Button>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-4 backdrop-blur-md lg:hidden">
        <Button size="xl" variant="hero" className="w-full" onClick={() => router.push("/checkout")}>
          Checkout &middot; {formatPrice(total)}
        </Button>
      </div>
    </div>
  );
}
