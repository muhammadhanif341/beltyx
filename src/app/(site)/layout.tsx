import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { CartSync } from "@/components/site/cart-sync";
import { WishlistSync } from "@/components/site/wishlist-sync";
import { WhatsAppWidget } from "@/components/site/whatsapp-widget";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CartSync />
      <WishlistSync />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppWidget />
    </>
  );
}
