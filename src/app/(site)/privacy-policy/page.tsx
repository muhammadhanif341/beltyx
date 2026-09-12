import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="September 2026">
      <p>
        Beltyx (&quot;we&quot;, &quot;us&quot;) respects your privacy. This policy explains what
        information we collect, how we use it, and the choices you have.
      </p>

      <h2>Information We Collect</h2>
      <ul>
        <li>Account details: name, email address, phone number</li>
        <li>Order information: shipping address, order history, payment method selected</li>
        <li>Usage data: pages viewed, products browsed, device and browser information</li>
        <li>Communications: messages you send us via the contact form</li>
      </ul>

      <h2>How We Use Your Information</h2>
      <ul>
        <li>To process and fulfill your orders</li>
        <li>To communicate order updates, and respond to inquiries</li>
        <li>To improve our products, website, and customer experience</li>
        <li>To send occasional marketing emails, which you can opt out of anytime</li>
      </ul>

      <h2>Data Storage &amp; Security</h2>
      <p>
        Your data is stored securely with Supabase, our database and authentication provider,
        using industry-standard encryption and access controls. We never sell your personal
        information to third parties.
      </p>

      <h2>Cookies</h2>
      <p>
        We use essential cookies and local storage to remember your cart, wishlist, and theme
        preference. These are not used for third-party advertising.
      </p>

      <h2>Your Rights</h2>
      <p>
        You can access, update, or request deletion of your personal data at any time by
        contacting us at <a href="/contact">our contact page</a> or through your account
        settings.
      </p>

      <h2>Changes to This Policy</h2>
      <p>
        We may update this policy periodically. Continued use of Beltyx after changes constitutes
        acceptance of the revised policy.
      </p>
    </LegalPage>
  );
}
