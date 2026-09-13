"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/site/search-bar";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { useCartStore } from "@/lib/store/cart-store";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { cn } from "cn";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/category/wallets", label: "Wallets" },
  { href: "/category/belts", label: "Belts" },
  { href: "/category/accessories", label: "Accessories" },
  { href: "/about", label: "About" },
];

export function Header() {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  const itemCount = useCartStore((s) => s.itemCount());
  const wishlistCount = useWishlistStore((s) => s.productIds.length);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-colors duration-300",
        scrolled
          ? "border-border bg-background/85 backdrop-blur-md"
          : "border-transparent bg-background/60 backdrop-blur-sm",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetContent side="left" className="w-[85vw] max-w-sm px-0">
              <SheetHeader className="border-b border-border">
                <SheetTitle className="font-display text-2xl">BELTYX</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
                {NAV_LINKS.map((link) => (
                  <SheetClose
                    key={link.href}
                    render={
                      <Link
                        href={link.href}
                        className="rounded-xl px-3 py-3 text-base font-medium transition-colors hover:bg-muted"
                      />
                    }
                  >
                    {link.label}
                  </SheetClose>
                ))}
                <div className="my-2 border-t border-border" />
                <SheetClose
                  render={<Link href="/account" className="rounded-xl px-3 py-3 text-base font-medium hover:bg-muted" />}
                >
                  My Account
                </SheetClose>
                <SheetClose
                  render={<Link href="/wishlist" className="rounded-xl px-3 py-3 text-base font-medium hover:bg-muted" />}
                >
                  Wishlist
                </SheetClose>
                <SheetClose
                  render={
                    <Link href="/account/orders" className="rounded-xl px-3 py-3 text-base font-medium hover:bg-muted" />
                  }
                >
                  Track Order
                </SheetClose>
              </nav>
              <div className="flex items-center justify-between border-t border-border p-4">
                <span className="text-sm font-medium text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
            </SheetContent>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-5" />
            </Button>
          </Sheet>

          <Link href="/" className="font-display text-2xl font-semibold tracking-wide">
            BELTYX
          </Link>
        </div>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <Search className="size-[18px]" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Wishlist"
            className="relative hidden lg:inline-flex"
            render={<Link href="/wishlist" />}
          >
            <Heart className="size-[18px]" />
            {wishlistCount > 0 && (
              <span className="absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
                {wishlistCount}
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Account"
            className="hidden lg:inline-flex"
            render={<Link href="/account" />}
          >
            <User className="size-[18px]" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Cart"
            className="relative"
            render={<Link href="/cart" />}
          >
            <ShoppingBag className="size-[18px]" />
            {itemCount > 0 && (
              <span className="absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
                {itemCount}
              </span>
            )}
          </Button>

          <ThemeToggle className="hidden lg:inline-flex" />
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-border bg-background/95 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
          <SearchBar autoFocus onNavigate={() => setSearchOpen(false)} />
        </div>
      )}
    </header>
  );
}
