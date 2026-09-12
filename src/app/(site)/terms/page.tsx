import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions" updated="September 2026">
      <p>
        These Terms &amp; Conditions govern your use of the Beltyx website and any purchases made
        through it. By using our site, you agree to these terms.
      </p>

      <h2>Orders &amp; Payment</h2>
      <p>
        All orders are subject to acceptance and availability. Prices are listed in USD and are
        subject to change without notice. We currently accept Cash on Delivery and Bank Transfer
        as payment methods.
      </p>

      <h2>Product Descriptions</h2>
      <p>
        We strive to display our products, including color and material, as accurately as
        possible. Because leather is a natural material, slight variations in grain and color
        between pieces are normal and not considered defects.
      </p>

      <h2>Account Responsibility</h2>
      <p>
        You are responsible for maintaining the confidentiality of your account credentials and
        for all activity that occurs under your account.
      </p>

      <h2>Intellectual Property</h2>
      <p>
        All content on this site — including logos, product photography, and copy — is the
        property of Beltyx and may not be reproduced without permission.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        Beltyx is not liable for any indirect, incidental, or consequential damages arising from
        the use of our products or website, to the fullest extent permitted by law.
      </p>

      <h2>Governing Law</h2>
      <p>
        These terms are governed by the laws of the jurisdiction in which Beltyx operates,
        without regard to conflict-of-law principles.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Reach out via <a href="/contact">our contact page</a>.
      </p>
    </LegalPage>
  );
}
