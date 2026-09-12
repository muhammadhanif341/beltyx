import type { Metadata } from "next";
import { ProductGrid } from "@/components/site/product-grid";
import { ProductFiltersSidebar, ProductFiltersMobile } from "@/components/site/product-filters";
import { SortSelect } from "@/components/site/sort-select";
import { getCategories, getProducts, type ProductFilters } from "@/lib/queries";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export const metadata: Metadata = {
  title: "Shop All Products",
  description: "Browse the full Beltyx collection of leather wallets, belts, and accessories.",
};

const PAGE_SIZE = 12;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const sort = (typeof params.sort === "string" ? params.sort : undefined) as
    | ProductFilters["sort"]
    | undefined;
  const page = Number(params.page) > 0 ? Number(params.page) : 1;
  const min = params.min ? Number(params.min) : undefined;
  const max = params.max ? Number(params.max) : undefined;

  const [categories, { products, total }] = await Promise.all([
    getCategories(),
    getProducts({ sort, page, pageSize: PAGE_SIZE, minPrice: min, maxPrice: max }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const buildHref = (p: number) => {
    const sp = new URLSearchParams();
    if (sort) sp.set("sort", sort);
    if (min != null) sp.set("min", String(min));
    if (max != null) sp.set("max", String(max));
    sp.set("page", String(p));
    return `/shop?${sp.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Shop</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">All Products</h1>
        <p className="mt-2 text-sm text-muted-foreground">{total} products</p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <ProductFiltersSidebar categories={categories} />

        <div className="flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <ProductFiltersMobile categories={categories} />
            <SortSelect />
          </div>

          <ProductGrid products={products} />

          {totalPages > 1 && (
            <Pagination className="mt-10">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={buildHref(Math.max(1, page - 1))}
                    aria-disabled={page === 1}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink href={buildHref(p)} isActive={p === page}>
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href={buildHref(Math.min(totalPages, page + 1))}
                    aria-disabled={page === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </div>
  );
}
