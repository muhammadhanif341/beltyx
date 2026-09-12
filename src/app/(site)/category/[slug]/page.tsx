import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/site/product-grid";
import { ProductFiltersSidebar, ProductFiltersMobile } from "@/components/site/product-filters";
import { SortSelect } from "@/components/site/sort-select";
import { getCategories, getCategoryBySlug, getProducts, type ProductFilters } from "@/lib/queries";

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
  const sort = (typeof sp.sort === "string" ? sp.sort : undefined) as ProductFilters["sort"] | undefined;
  const page = Number(sp.page) > 0 ? Number(sp.page) : 1;

  const [categories, category] = await Promise.all([getCategories(), getCategoryBySlug(slug)]);

  if (!category && categories.length > 0) {
    notFound();
  }

  const { products, total } = await getProducts({
    categorySlug: slug,
    sort,
    page,
    pageSize: PAGE_SIZE,
  });

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
        <ProductFiltersSidebar categories={categories} activeCategory={slug} />

        <div className="flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <ProductFiltersMobile categories={categories} activeCategory={slug} />
            <SortSelect />
          </div>

          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  );
}
