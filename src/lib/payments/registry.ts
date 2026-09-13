import type { PaymentProvider } from "./types";
import { codProvider } from "./providers/cod";
import { bankTransferProvider } from "./providers/bank-transfer";
import { mockCardProvider } from "./providers/mock-card";
import { stripeProvider } from "./providers/stripe";
import { jazzCashProvider } from "./providers/jazzcash";
import { easypaisaProvider } from "./providers/easypaisa";

const ALL_PROVIDERS: PaymentProvider[] = [
  codProvider,
  bankTransferProvider,
  mockCardProvider,
  stripeProvider,
  jazzCashProvider,
  easypaisaProvider,
];

/** Only providers ready to accept a real (or mock) payment are shown at checkout. */
export function getAvailableProviders(): PaymentProvider[] {
  return ALL_PROVIDERS.filter((p) => p.isConfigured());
}

export function getProvider(id: string): PaymentProvider | undefined {
  return ALL_PROVIDERS.find((p) => p.id === id && p.isConfigured());
}
