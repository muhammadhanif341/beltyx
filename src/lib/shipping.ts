import type { ShippingMethod } from "@/lib/types";

export const SHIPPING_FEES: Record<ShippingMethod, number> = { standard: 8, express: 18 };
export const FREE_SHIPPING_THRESHOLD = 75;
export const DELIVERY_DAYS: Record<ShippingMethod, number> = { standard: 6, express: 2 };

export function computeShippingFee(method: ShippingMethod, amountAfterDiscount: number): number {
  if (method === "express") return SHIPPING_FEES.express;
  return amountAfterDiscount >= FREE_SHIPPING_THRESHOLD || amountAfterDiscount <= 0 ? 0 : SHIPPING_FEES.standard;
}

export function estimatedDeliveryDate(method: ShippingMethod): string {
  const date = new Date();
  date.setDate(date.getDate() + DELIVERY_DAYS[method]);
  return date.toISOString().slice(0, 10);
}

export function formatEstimatedDelivery(method: ShippingMethod): string {
  const iso = estimatedDeliveryDate(method);
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric" }).format(new Date(iso));
}
