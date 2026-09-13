import type { PaymentProvider } from "../types";

/**
 * Stripe is registered but stays hidden from checkout until STRIPE_SECRET_KEY
 * is set — wire up `stripe` (npm) and create a real Checkout Session here
 * once keys are available. Never hard-code a key.
 */
export const stripeProvider: PaymentProvider = {
  id: "stripe",
  label: "Card Payment (Stripe)",
  description: "Pay securely by card via Stripe",
  mode: "redirect",
  isConfigured: () => Boolean(process.env.STRIPE_SECRET_KEY),
  async createPayment() {
    if (!process.env.STRIPE_SECRET_KEY) {
      return { ok: false, status: "unpaid", message: "Stripe is not configured." };
    }
    // Placeholder for a real Stripe Checkout Session — not implemented since
    // no live credentials exist yet.
    return { ok: false, status: "unpaid", message: "Stripe integration is not yet implemented." };
  },
};
