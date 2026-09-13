"use client";

import * as React from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { subscribeToNewsletter } from "@/lib/actions/newsletter";
import { toast } from "sonner";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All Products" },
      { href: "/category/wallets", label: "Wallets" },
      { href: "/category/belts", label: "Belts" },
      { href: "/category/card-holders", label: "Card Holders" },
      { href: "/category/gift-sets", label: "Gift Sets" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/shipping-policy", label: "Shipping Policy" },
      { href: "/return-policy", label: "Returns & Refunds" },
      { href: "/contact", label: "Contact Us" },
      { href: "/account/orders", label: "Track My Order" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Beltyx" },
      { href: "/privacy-policy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms & Conditions" },
    ],
  },
];

export function Footer() {
  const [email, setEmail] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    const result = await subscribeToNewsletter(email.trim());
    setSubmitting(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setEmail("");
  }

  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="font-display text-2xl font-semibold tracking-wide">
              BELTYX
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Full-grain leather wallets, belts, and everyday-carry essentials, made to be lived
              in and to age beautifully.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {["IG", "FB", "X"].map((label) => (
                <a
                  key={label}
                  href="#"
                  aria-label={`Beltyx on ${label}`}
                  className="flex size-9 items-center justify-center rounded-full border border-border text-xs font-semibold text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-base font-semibold">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="font-display text-base font-semibold uppercase">Join the Beltyx Club</h4>
            <p className="mt-4 text-sm text-muted-foreground">
              New arrivals and offers, no spam. Unsubscribe anytime.
            </p>
            <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={handleSubscribe}>
              <div className="relative flex-1">
                <Mail className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="h-10 rounded-full pl-8"
                  required
                />
              </div>
              <Button type="submit" variant="hero" className="shrink-0 rounded-full" disabled={submitting}>
                {submitting ? "Joining..." : "Join Now"}
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Beltyx. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:text-accent">Privacy</Link>
            <Link href="/terms" className="hover:text-accent">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
