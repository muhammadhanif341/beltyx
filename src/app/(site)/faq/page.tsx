import type { Metadata } from "next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Beltyx products, shipping, and returns.",
};

const FAQS = [
  {
    q: "What kind of leather do you use?",
    a: "All Beltyx products are made from full-grain or vegetable-tanned leather — the highest quality grades available. We never use bonded or corrected-grain leather.",
  },
  {
    q: "How long will my order take to arrive?",
    a: "Orders are processed within 1-2 business days and typically arrive within 5-10 business days depending on your location. You'll receive tracking details once your order ships.",
  },
  {
    q: "Do you offer free shipping?",
    a: "Yes — orders over $75 ship free. Orders under that threshold have a flat $8 shipping fee.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We currently accept Cash on Delivery and Bank Transfer. Card payments are coming soon.",
  },
  {
    q: "Can I return or exchange an item?",
    a: "Yes, unused items in original condition can be returned within 30 days of delivery. See our Return & Refund Policy for full details.",
  },
  {
    q: "How do I care for my leather goods?",
    a: "Wipe clean with a dry cloth and avoid prolonged water exposure. Condition your leather every 3-6 months with a quality leather balm to keep it supple.",
  },
  {
    q: "Do you offer gift wrapping?",
    a: "All Gift Set orders ship in our signature Beltyx gift box at no extra charge. Individual items can be gift-wrapped on request — just add a note at checkout.",
  },
  {
    q: "Is there a warranty on Beltyx products?",
    a: "Every product comes with a 2-year craftsmanship guarantee covering manufacturing defects in materials and stitching.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Help Center</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Frequently Asked Questions</h1>

      <Accordion className="mt-8">
        {FAQS.map((item, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left font-display text-lg">{item.q}</AccordionTrigger>
            <AccordionContent>{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
