import type { PaymentProvider } from "../types";

export const bankTransferProvider: PaymentProvider = {
  id: "bank_transfer",
  label: "Bank Transfer",
  description: "Transfer details are sent to your email after checkout",
  mode: "manual",
  isConfigured: () => true,
  async createPayment() {
    return { ok: true, status: "unpaid" };
  },
};
