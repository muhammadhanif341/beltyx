"use client";

import * as React from "react";
import { MessageCircle, Package, CreditCard, RotateCcw, ShoppingBag, Truck, X } from "lucide-react";
import { cn } from "cn";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

const MENU = [
  { icon: Truck, label: "Track My Order", message: "Hi! I'd like to track my order." },
  { icon: ShoppingBag, label: "Product Information", message: "Hi! I have a question about a product." },
  { icon: Package, label: "Shipping Information", message: "Hi! I have a question about shipping." },
  { icon: RotateCcw, label: "Return / Exchange", message: "Hi! I'd like to start a return or exchange." },
  { icon: CreditCard, label: "Payment Help", message: "Hi! I need help with a payment." },
  { icon: MessageCircle, label: "Talk to Support", message: "Hi! I'd like to talk to someone from support." },
];

/**
 * A WhatsApp click-to-chat widget — no API credentials required, since it
 * just deep-links to wa.me. Swap in the WhatsApp Business API here (server
 * side, behind an API route) once credentials are available; never expose
 * API keys in this component.
 */
export function WhatsAppWidget() {
  const [open, setOpen] = React.useState(false);

  if (!WHATSAPP_NUMBER) return null;

  function openChat(message: string) {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  return (
    <div className="fixed right-4 bottom-4 z-40 sm:right-6 sm:bottom-6">
      {open && (
        <div className="mb-3 w-72 overflow-hidden rounded-3xl bg-card shadow-[0_20px_50px_-15px_rgba(0,0,0,0.35)] ring-1 ring-border">
          <div className="flex items-center justify-between bg-[#25D366] px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">Beltyx Support</p>
              <p className="text-xs opacity-90">Hi! Welcome to Beltyx 👋 How can we help?</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close">
              <X className="size-4" />
            </button>
          </div>
          <div className="flex flex-col p-2">
            {MENU.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => openChat(item.message)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted"
              >
                <item.icon className="size-4 shrink-0 text-accent" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Chat with us on WhatsApp"
        className={cn(
          "flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] transition-transform hover:scale-105",
        )}
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>
    </div>
  );
}
