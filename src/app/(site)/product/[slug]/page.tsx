import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Star } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ProductGallery } from "@/components/site/product-gallery";
import { ProductOptions } from "@/components/site/product-options";
import { DeliveryInfoStrip } from "@/components/site/delivery-info-strip";
import { StockStatus } from "@/components/site/stock-status";
import { ProductGrid } from "@/components/site/product-grid";
import { ReviewSection } from "@/components/site/review-section";
import { SectionHeading } from "@/components/site/section-heading";
import {
  getApprovedReviews,
  getProductBySlug,
  getRelatedProducts,
  trackProductView,
} from "@/lib/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product" };
  const description = product.description ?? `Shop the ${product.name} at Beltyx.`;
  const image = product.images?.[0]?.url;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      images: image ? [{ url: image, alt: product.images?.[0]?.alt ?? product.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, reviews] = await Promise.all([
    getRelatedProducts(product.category_id, product.id),
    getApprovedReviews(product.id),
    trackProductView(product.id),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: product.images?.map((img) => img.url),
    sku: product.sku ?? undefined,
    brand: { "@type": "Brand", name: "BELTYX" },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/product/${product.slug}`,
      priceCurrency: "USD",
      price: product.price,
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    ...(product.rating_count > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating_avg,
        reviewCount: product.rating_count,
      },
    }),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/shop" className="hover:text-accent">Shop</Link>
        <ChevronRight className="size-3" />
        {product.category && (
          <>
            <Link href={`/category/${product.category.slug}`} className="hover:text-accent">
              {product.category.name}
            </Link>
            <ChevronRight className="size-3" />
          </>
        )}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images ?? []} productName={product.name} />

        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
            {product.category?.name ?? product.material}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">{product.name}</h1>

          {product.rating_count > 0 && (
            <div className="mt-2 flex items-center gap-1.5 text-sm">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-4 ${i < Math.round(product.rating_avg) ? "fill-accent text-accent" : "text-muted-foreground"}`}
                  />
                ))}
              </div>
              <span className="text-muted-foreground">
                {product.rating_avg.toFixed(1)} ({product.rating_count} reviews)
              </span>
            </div>
          )}

          <p className="mt-4 text-muted-foreground">{product.description}</p>

          <StockStatus stock={product.stock} lowStockThreshold={product.low_stock_threshold} className="mt-3" />

          <div className="mt-6 flex flex-col gap-5">
            <ProductOptions product={product} />
            <DeliveryInfoStrip />
          </div>

          <Accordion className="mt-8">
            <AccordionItem value="description">
              <AccordionTrigger>Description</AccordionTrigger>
              <AccordionContent>
                {product.description ?? "A Beltyx essential, crafted from full-grain leather."}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="specifications">
              <AccordionTrigger>Specifications</AccordionTrigger>
              <AccordionContent>
                <ul className="list-inside list-disc space-y-1">
                  {product.sku && <li>SKU: {product.sku}</li>}
                  {product.category && <li>Category: {product.category.name}</li>}
                  {Object.entries(product.specifications ?? {}).map(([key, value]) => (
                    <li key={key}>
                      {key}: {value}
                    </li>
                  ))}
                  {Object.keys(product.specifications ?? {}).length === 0 && (
                    <li>Hand-finished edges, reinforced stitching</li>
                  )}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="materials">
              <AccordionTrigger>Materials</AccordionTrigger>
              <AccordionContent>
                {product.material ?? "Full-grain leather"}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="care">
              <AccordionTrigger>Care Instructions</AccordionTrigger>
              <AccordionContent>
                {product.care_instructions ?? "Wipe clean with a dry cloth. Condition every 3-6 months."}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping">
              <AccordionTrigger>Shipping Information</AccordionTrigger>
              <AccordionContent>
                Free shipping on orders over $75. 30-day returns on unused items — see our{" "}
                <Link href="/return-policy" className="text-accent underline">
                  Return Policy
                </Link>{" "}
                for details.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <SectionHeading eyebrow="You May Also Like" title="Related Products" className="mb-8" />
          <ProductGrid products={related} />
        </section>
      )}

      <section className="mt-20 border-t border-border pt-14">
        <ReviewSection productId={product.id} reviews={reviews} />
      </section>
    </div>
  );
}
