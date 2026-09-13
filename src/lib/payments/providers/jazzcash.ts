import type { PaymentProvider } from "../types";

/**
 * JazzCash (Pakistan) — registered but hidden from checkout until merchant
 * credentials are provided. Wire up the JazzCash Mobile Wallet / HBL
 * PayPlus API here once JAZZCASH_MERCHANT_ID / JAZZCASH_PASSWORD /
 * JAZZCASH_INTEGRITY_SALT are set. Never hard-code credentials.
 */
export const jazzCashProvider: PaymentProvider = {
  id: "jazzcash",
  label: "JazzCash",
  description: "Pay with your JazzCash mobile wallet",
  mode: "redirect",
  isConfigured: () => Boolean(process.env.JAZZCASH_MERCHANT_ID && process.env.JAZZCASH_INTEGRITY_SALT),
  async createPayment() {
    if (!process.env.JAZZCASH_MERCHANT_ID) {
      return { ok: false, status: "unpaid", message: "JazzCash is not configured." };
    }
    return { ok: false, status: "unpaid", message: "JazzCash integration is not yet implemented." };
  },
};
