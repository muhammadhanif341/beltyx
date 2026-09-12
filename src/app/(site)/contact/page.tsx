import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/site/contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the Beltyx team.",
};

const DETAILS = [
  { icon: Mail, label: "Email", value: "support@beltyx.com" },
  { icon: Phone, label: "Phone", value: "+1 (555) 018-2934" },
  { icon: MapPin, label: "Studio", value: "123 Leather Lane, Lahore, Pakistan" },
  { icon: Clock, label: "Hours", value: "Mon–Sat, 10am–7pm PKT" },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Contact</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">We&apos;d Love to Hear From You</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Questions about an order, a product, or a wholesale inquiry? Send us a message and we&apos;ll
        get back to you within 1-2 business days.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl bg-card p-6 ring-1 ring-border sm:p-8">
          <ContactForm />
        </div>

        <div className="flex flex-col gap-4">
          {DETAILS.map((d) => (
            <div key={d.label} className="flex items-start gap-3 rounded-2xl bg-card p-5 ring-1 ring-border">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                <d.icon className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">{d.label}</p>
                <p className="text-sm text-muted-foreground">{d.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
