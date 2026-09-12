import { RotateCcw, ShieldCheck, Truck } from "lucide-react";

const FEATURES = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On all orders over $75",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "30-day return policy",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    description: "Cash on delivery or bank transfer",
  },
];

export function FeatureStrip() {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-3xl bg-card p-6 ring-1 ring-border sm:grid-cols-3 sm:p-8">
      {FEATURES.map((feature) => (
        <div key={feature.title} className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
            <feature.icon className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">{feature.title}</p>
            <p className="text-xs text-muted-foreground">{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
