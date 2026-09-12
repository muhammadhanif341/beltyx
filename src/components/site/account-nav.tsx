"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, LayoutDashboard, LogOut, Package, Star } from "lucide-react";
import { cn } from "cn";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href: "/account", label: "Dashboard", icon: LayoutDashboard },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/reviews", label: "My Reviews", icon: Star },
];

export function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="flex gap-2 overflow-x-auto lg:w-56 lg:flex-col lg:overflow-visible">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-accent/10 text-accent" : "text-foreground/80 hover:bg-muted",
            )}
          >
            <link.icon className="size-4" />
            {link.label}
          </Link>
        );
      })}
      <button
        onClick={handleSignOut}
        className="flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
      >
        <LogOut className="size-4" />
        Sign Out
      </button>
    </nav>
  );
}
