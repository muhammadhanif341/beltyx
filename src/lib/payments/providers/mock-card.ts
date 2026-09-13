import type { PaymentProvider } from "../types";

/**
 * A working test/mock card flow, kept deliberately separate from any real
 * gateway integration. No card details are collected or stored — this exists
 * so "Card Payment" can be demoed end-to-end before Stripe (or another
 * processor) credentials are available.
 */
export const mockCardProvider: PaymentProvider = {
  id: "card_mock",
  label: "Card Payment (Test Mode)",
  description: "Simulated card payment for demos — no real charge is made",
  mode: "mock",
  isConfigured: () => process.env.NODE_ENV !== "production" || process.env.ENABLE_MOCK_PAYMENTS === "true",
  async createPayment() {
    return { ok: true, status: "paid", message: "Test payment approved (no real charge was made)." };
  },
};
