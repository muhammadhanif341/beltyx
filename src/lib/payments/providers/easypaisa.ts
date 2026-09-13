import type { PaymentProvider } from "../types";

/**
 * Easypaisa (Pakistan) — registered but hidden from checkout until merchant
 * credentials are provided. Wire up the Easypaisa Open API here once
 * EASYPAISA_STORE_ID / EASYPAISA_HASH_KEY are set. Never hard-code credentials.
 */
export const easypaisaProvider: PaymentProvider = {
  id: "easypaisa",
  label: "Easypaisa",
  description: "Pay with your Easypaisa account",
  mode: "redirect",
  isConfigured: () => Boolean(process.env.EASYPAISA_STORE_ID && process.env.EASYPAISA_HASH_KEY),
  async createPayment() {
    if (!process.env.EASYPAISA_STORE_ID) {
      return { ok: false, status: "unpaid", message: "Easypaisa is not configured." };
    }
    return { ok: false, status: "unpaid", message: "Easypaisa integration is not yet implemented." };
  },
};
