import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/site/product-grid";
import { ProductFiltersSidebar, ProductFiltersMobile } from "@/components/site/product-filters";
import { SortSelect } from "@/components/site/sort-select";
import { getCategories, getCategoryBySlug, getFilterOptions, getProducts, type ProductFilters } from "@/lib/queries";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PAGE_SIZE = 12;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category" };
  return {
    title: category.name,
    description: category.description ?? `Shop ${category.name} at Beltyx.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const str = (key: string) => (typeof sp[key] === "string" ? (sp[key] as string) : undefined);
  const sort = str("sort") as ProductFilters["sort"] | undefined;
  const page = Number(sp.page) > 0 ? Number(sp.page) : 1;
  const min = sp.min ? Number(sp.min) : undefined;
  const max = sp.max ? Number(sp.max) : undefined;
  const size = str("size");
  const color = str("color");
  const inStockOnly = sp.inStock === "1";
  const minRating = sp.rating ? Number(sp.rating) : undefined;

  const [categories, category, filterOptions] = await Promise.all([
    getCategories(),
    getCategoryBySlug(slug),
    getFilterOptions(),
  ]);

  if (!category && categories.length > 0) {
    notFound();
  }

  const { products, total } = await getProducts({
    categorySlug: slug,
    sort,
    page,
    pageSize: PAGE_SIZE,
    minPrice: min,
    maxPrice: max,
    size,
    color,
    inStockOnly,
    minRating,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const buildHref = (p: number) => {
    const sp = new URLSearchParams();
    if (sort) sp.set("sort", sort);
    if (min != null) sp.set("min", String(min));
    if (max != null) sp.set("max", String(max));
    if (size) sp.set("size", size);
    if (color) sp.set("color", color);
    if (inStockOnly) sp.set("inStock", "1");
    if (minRating != null) sp.set("rating", String(minRating));
    sp.set("page", String(p));
    return `/category/${slug}?${sp.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Category</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">
          {category?.name ?? slug}
        </h1>
        {category?.description && (
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">{category.description}</p>
        )}
        <p className="mt-2 text-sm text-muted-foreground">{total} products</p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <ProductFiltersSidebar
          categories={categories}
          activeCategory={slug}
          sizes={filterOptions.sizes}
          colors={filterOptions.colors}
        />

        <div className="flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <ProductFiltersMobile
              categories={categories}
              activeCategory={slug}
              sizes={filterOptions.sizes}
              colors={filterOptions.colors}
            />
            <SortSelect />
          </div>

          <ProductGrid products={products} />

          {totalPages > 1 && (
            <Pagination className="mt-10">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href={buildHref(Math.max(1, page - 1))} aria-disabled={page === 1} />
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
