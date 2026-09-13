import { RotateCcw, ShieldCheck, Truck } from "lucide-react";

const ITEMS = [
  { icon: Truck, title: "Free delivery", description: "On orders over $75" },
  { icon: RotateCcw, title: "30-day returns", description: "Unused items, original packaging" },
  { icon: ShieldCheck, title: "Secure payment", description: "Cash on delivery or bank transfer" },
];

export function DeliveryInfoStrip() {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-2xl border border-border p-4 sm:grid-cols-3">
      {ITEMS.map((item) => (
        <div key={item.title} className="flex items-center gap-2.5">
          <item.icon className="size-4 shrink-0 text-accent" />
          <div>
            <p className="text-xs font-semibold">{item.title}</p>
            <p className="text-[11px] text-muted-foreground">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
