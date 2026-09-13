"use server";

import { getAvailableProviders } from "@/lib/payments/registry";

export interface PaymentOption {
  id: string;
  label: string;
  description: string;
  mode: string;
}

export async function getPaymentOptions(): Promise<PaymentOption[]> {
  return getAvailableProviders().map((p) => ({ id: p.id, label: p.label, description: p.description, mode: p.mode }));
}
