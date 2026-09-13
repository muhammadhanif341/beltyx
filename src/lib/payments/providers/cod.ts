import type { PaymentProvider } from "../types";

export const codProvider: PaymentProvider = {
  id: "cod",
  label: "Cash on Delivery",
  description: "Pay in cash when your order arrives",
  mode: "manual",
  isConfigured: () => true,
  async createPayment() {
    return { ok: true, status: "unpaid" };
  },
};
