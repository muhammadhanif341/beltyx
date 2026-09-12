import {
  BadgePercent,
  Banknote,
  CircleDot,
  CreditCard,
  Gift,
  Sparkles,
  Wallet,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  wallet: Wallet,
  "circle-dot": CircleDot,
  "credit-card": CreditCard,
  banknote: Banknote,
  gift: Gift,
  sparkles: Sparkles,
  "badge-percent": BadgePercent,
};

export function CategoryIcon({ name, className }: { name?: string | null; className?: string }) {
  const Icon = (name && ICONS[name]) || Wallet;
  return <Icon className={className} />;
}
