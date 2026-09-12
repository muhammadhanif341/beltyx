import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = { title: "Shipping Policy" };

export default function ShippingPolicyPage() {
  return (
    <LegalPage title="Shipping Policy" updated="September 2026">
      <h2>Processing Time</h2>
      <p>
        Orders are processed and packed within 1-2 business days of being placed. You&apos;ll
        receive a confirmation email once your order ships, along with tracking information.
      </p>

      <h2>Shipping Rates &amp; Delivery Estimates</h2>
      <ul>
        <li>Orders over $75: Free standard shipping</li>
        <li>Orders under $75: Flat $8 shipping fee</li>
        <li>Standard delivery: 5-10 business days</li>
        <li>Remote areas may experience additional delays</li>
      </ul>

      <h2>Order Tracking</h2>
      <p>
        Once your order ships, you can track its status anytime from{" "}
        <a href="/account/orders">My Orders</a> in your account.
      </p>

      <h2>International Shipping</h2>
      <p>
        We currently ship to select international destinations. Delivery times and any customs
        duties or import taxes vary by country and are the responsibility of the customer.
      </p>

      <h2>Lost or Delayed Packages</h2>
      <p>
        If your package hasn&apos;t arrived within the estimated delivery window, please{" "}
        <a href="/contact">contact us</a> and we&apos;ll help track it down.
      </p>
    </LegalPage>
  );
}
