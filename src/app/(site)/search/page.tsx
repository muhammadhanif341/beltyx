import type { Metadata } from "next";
import { ProductGrid } from "@/components/site/product-grid";
import { searchProducts } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Search",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const products = q ? await searchProducts(q) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Search</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">
        {q ? `Results for "${q}"` : "Search Beltyx"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {q ? `${products.length} products found` : "Enter a search term to find wallets, belts, and more."}
      </p>

      <div className="mt-8">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
