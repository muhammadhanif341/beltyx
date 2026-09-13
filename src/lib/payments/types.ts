export interface PaymentContext {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  customerEmail: string;
}

export interface PaymentResult {
  ok: boolean;
  status: "unpaid" | "paid" | "pending";
  message?: string;
  redirectUrl?: string;
}

export type PaymentMode = "manual" | "mock" | "redirect";

export interface PaymentProvider {
  id: string;
  label: string;
  description: string;
  mode: PaymentMode;
  /** Whether this provider has everything it needs (env vars, etc.) to run. */
  isConfigured(): boolean;
  /** Called after the order row is created to (optionally) collect/confirm payment. */
  createPayment(ctx: PaymentContext): Promise<PaymentResult>;
}
