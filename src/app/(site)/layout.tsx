import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { CartSync } from "@/components/site/cart-sync";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CartSync />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
