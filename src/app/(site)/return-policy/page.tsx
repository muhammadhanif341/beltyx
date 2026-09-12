import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = { title: "Return & Refund Policy" };

export default function ReturnPolicyPage() {
  return (
    <LegalPage title="Return & Refund Policy" updated="September 2026">
      <h2>30-Day Returns</h2>
      <p>
        We want you to love what you carry. If you&apos;re not satisfied, you may return unused,
        unworn items in their original condition within 30 days of delivery for a full refund or
        exchange.
      </p>

      <h2>Eligibility</h2>
      <ul>
        <li>Item must be unused and show no signs of wear</li>
        <li>Original packaging and any accompanying gift box must be included</li>
        <li>Proof of purchase (order number or receipt) is required</li>
        <li>Custom or personalized items are not eligible for return</li>
      </ul>

      <h2>How to Start a Return</h2>
      <p>
        Contact us at <a href="/contact">our contact page</a> with your order number and reason
        for return. We&apos;ll provide return instructions and, once the item is received and
        inspected, process your refund to the original payment method within 5-7 business days.
      </p>

      <h2>Exchanges</h2>
      <p>
        Need a different size or color? Let us know when you request your return and we&apos;ll
        prioritize getting the replacement out to you as soon as the original item is received.
      </p>

      <h2>Damaged or Defective Items</h2>
      <p>
        If your item arrives damaged or with a manufacturing defect, contact us within 7 days of
        delivery with photos, and we&apos;ll arrange a free replacement or full refund — no return
        shipping cost to you.
      </p>
    </LegalPage>
  );
}
