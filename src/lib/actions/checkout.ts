"use server";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { computeDiscount, validateCoupon } from "@/lib/queries";
import type { PaymentMethod, ShippingAddress } from "@/lib/types";

export interface CheckoutLine {
  productId: string;
  variantId: string | null;
  name: string;
  variantLabel: string | null;
  unitPrice: number;
  quantity: number;
  image: string | null;
}

export interface CheckoutInput {
  lines: CheckoutLine[];
  shippingAddress: ShippingAddress;
  contactEmail: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  couponCode?: string | null;
}

export type CheckoutResult =
  | { ok: true; orderId: string; orderNumber: string }
  | { ok: false; message: string };

function generateOrderNumber() {
  return `BX${Date.now().toString(36).toUpperCase()}`;
}

export async function createOrder(input: CheckoutInput): Promise<CheckoutResult> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "Store is not connected to a database yet." };
  }
  if (input.lines.length === 0) {
    return { ok: false, message: "Your bag is empty." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const subtotal = input.lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  let discount = 0;

  if (input.couponCode) {
    const result = await validateCoupon(input.couponCode, subtotal);
    if (!result.ok) {
      return { ok: false, message: result.message };
    }
    discount = computeDiscount(result.coupon, subtotal);
  }

  const shippingFee = subtotal - discount >= 75 || subtotal - discount <= 0 ? 0 : 8;
  const total = Math.max(0, subtotal - discount + shippingFee);
  const orderNumber = generateOrderNumber();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user?.id ?? null,
      order_number: orderNumber,
      payment_method: input.paymentMethod,
      subtotal,
      discount,
      shipping_fee: shippingFee,
      total,
      coupon_code: input.couponCode || null,
      shipping_address: input.shippingAddress,
      contact_email: input.contactEmail,
      notes: input.notes || null,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    console.error("Order creation failed:", orderError);
    return { ok: false, message: "Couldn't place your order. Please try again." };
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    input.lines.map((line) => ({
      order_id: order.id,
      product_id: line.productId,
      variant_id: line.variantId,
      product_name: line.name,
      variant_label: line.variantLabel,
      unit_price: line.unitPrice,
      quantity: line.quantity,
      subtotal: line.unitPrice * line.quantity,
      image_url: line.image,
    })),
  );

  if (itemsError) {
    console.error("Order items creation failed:", itemsError);
    return { ok: false, message: "Order created, but some items failed to save. Contact support." };
  }

  return { ok: true, orderId: order.id, orderNumber: order.order_number };
}

export async function checkCoupon(code: string, subtotal: number) {
  const result = await validateCoupon(code, subtotal);
  if (!result.ok) return result;
  const discount = computeDiscount(result.coupon, subtotal);
  return { ok: true as const, discount, code: result.coupon.code };
}
