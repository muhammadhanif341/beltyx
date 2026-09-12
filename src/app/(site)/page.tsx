import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Hammer, ShieldCheck, Sparkles, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/site/product-card";
import { CategoryShowcase } from "@/components/site/category-showcase";
import { FeatureStrip } from "@/components/site/feature-strip";
import { SectionHeading } from "@/components/site/section-heading";
import { FadeIn, StaggerGrid, StaggerItem } from "@/components/site/fade-in";
import { getCategories, getFeaturedProducts, getNewProducts } from "@/lib/queries";
import { formatPrice } from "@/lib/format";

const TESTIMONIALS = [
  {
    quote:
      "Three years of daily use and the patina on my Heritage Bifold looks better every month. Worth every rupee.",
    name: "Ahmed R.",
    role: "Verified Buyer",
  },
  {
    quote: "The Classic Leather Belt is the last belt I'll ever need to buy. Buckle still feels brand new.",
    name: "Sana K.",
    role: "Verified Buyer",
  },
  {
    quote: "Ordered the Signature Gift Set for my father — packaging alone felt like a luxury brand.",
    name: "Bilal M.",
    role: "Verified Buyer",
  },
];

export default async function HomePage() {
  const [categories, featured, newArrivals] = await Promise.all([
    getCategories(),
    getFeaturedProducts(4),
    getNewProducts(4),
  ]);

  const heroProduct = featured[0];

  return (
    <div className="pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 pt-10 pb-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pt-16 lg:pb-24">
          <FadeIn>
            <p className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-accent uppercase">
              <Sparkles className="size-3.5" />
              Full-grain leather, since day one
            </p>
            <h1 className="mt-5 font-display text-4xl leading-[1.05] font-semibold uppercase sm:text-5xl lg:text-6xl">
              Crafted for every day.
              <span className="gold-text-gradient block">Built to last.</span>
            </h1>
            <p className="mt-5 max-w-md text-base text-muted-foreground sm:text-lg">
              Premium leather wallets and belts designed with timeless craftsmanship.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="xl" variant="hero" render={<Link href="/category/wallets" />}>
                Shop Wallets
                <ArrowRight className="size-4" data-icon="inline-end" />
              </Button>
              <Button size="xl" variant="heroOutline" render={<Link href="/category/belts" />}>
                Shop Belts
              </Button>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-accent" />
                2-Year Craftsmanship Guarantee
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.15} className="relative">
            <div className="leather-glow relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-4xl bg-card ring-1 ring-border">
              {heroProduct ? (
                <>
                  <Image
                    src={heroProduct.images?.[0]?.url ?? "https://placehold.co/900x1100/151311/e8c77a?text=Beltyx"}
                    alt={heroProduct.name}
                    fill
                    priority
                    sizes="(min-width: 1024px) 420px, 90vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent p-6 text-white">
                    <p className="text-xs tracking-wide text-white/70 uppercase">Featured</p>
                    <p className="font-display text-2xl font-semibold">{heroProduct.name}</p>
                    <p className="mt-1 font-display text-xl text-[#e8c77a]">
                      {formatPrice(heroProduct.price)}
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center p-10 text-center text-muted-foreground">
                  Add featured products from the admin dashboard to showcase them here.
                </div>
              )}
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-card px-5 py-4 ring-1 ring-border sm:block">
              <p className="font-display text-2xl font-semibold text-accent">10k+</p>
              <p className="text-xs text-muted-foreground">Happy customers</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-0 sm:px-6 lg:px-8">
        <FadeIn className="px-4 sm:px-0">
          <SectionHeading eyebrow="Collections" title="Shop by Category" className="mb-8" />
        </FadeIn>
        <div className="px-4 sm:px-0">
          <CategoryShowcase categories={categories} />
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <SectionHeading
            eyebrow="Customer Favorites"
            title="Bestsellers"
            description="The pieces our customers reach for again and again."
            href="/shop"
            className="mb-8"
          />
        </FadeIn>
        {featured.length > 0 ? (
          <StaggerGrid className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {featured.map((product, i) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} priority={i < 2} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        ) : (
          <EmptyCatalogNotice />
        )}
      </section>

      {/* Brand story */}
      <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="grid grid-cols-1 items-center gap-10 overflow-hidden rounded-4xl bg-[#1a140f] text-[#f3ede1] lg:grid-cols-2">
          <div className="relative aspect-[4/3] w-full lg:aspect-auto lg:h-full lg:min-h-[520px]">
            <Image
              src="https://placehold.co/900x1100/2a1f16/e8c77a?text=Beltyx+Craft"
              alt="A Beltyx craftsperson hand-stitching a leather wallet"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="px-6 py-10 sm:px-10 lg:px-4 lg:py-14 lg:pr-14">
            <p className="text-xs font-semibold tracking-[0.2em] text-[#e8c77a] uppercase">
              Our Craft
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold uppercase sm:text-4xl">
              Made to age beautifully
            </h2>
            <p className="mt-4 max-w-lg text-[#f3ede1]/75">
              Every Beltyx piece starts as full-grain hide, cut and stitched by small
              workshops we&apos;ve partnered with for years — leather that gets better
              with age, not worse.
            </p>
            <dl className="mt-8 grid grid-cols-2 gap-6">
              {[
                { icon: Sparkles, label: "Quality Leather", value: "Full-grain hides" },
                { icon: Hammer, label: "Craftsmanship", value: "Hand-cut & stitched" },
                { icon: ShieldCheck, label: "Durability", value: "Built to outlast trends" },
                { icon: Timer, label: "Timeless Design", value: "Never goes out of style" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <item.icon className="mt-0.5 size-5 shrink-0 text-[#e8c77a]" />
                  <div>
                    <dt className="text-sm font-semibold">{item.label}</dt>
                    <dd className="text-xs text-[#f3ede1]/65">{item.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <Button variant="hero" size="lg" className="mt-8" render={<Link href="/about" />}>
              Read Our Story
            </Button>
          </div>
        </FadeIn>
      </section>

      {/* New arrivals */}
      {newArrivals.length > 0 && (
        <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <SectionHeading
              eyebrow="Just Dropped"
              title="New Arrivals"
              href="/shop?sort=newest"
              className="mb-8"
            />
          </FadeIn>
          <StaggerGrid className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {newArrivals.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        </section>
      )}

      {/* Testimonials */}
      <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <SectionHeading eyebrow="Testimonials" title="Loved by Everyday Carriers" className="mb-8" />
        </FadeIn>
        <StaggerGrid className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <StaggerItem key={t.name}>
              <figure className="flex h-full flex-col justify-between rounded-3xl bg-card p-6 ring-1 ring-border">
                <blockquote className="font-display text-lg leading-snug italic">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 text-sm">
                  <span className="font-semibold">{t.name}</span>
                  <span className="text-muted-foreground"> — {t.role}</span>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </section>

      {/* Feature strip */}
      <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <FeatureStrip />
        </FadeIn>
      </section>
    </div>
  );
}

function EmptyCatalogNotice() {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/60 p-10 text-center text-sm text-muted-foreground">
      No products yet. Connect Supabase and add products from the{" "}
      <Link href="/admin/products" className="text-accent underline">
        admin dashboard
      </Link>{" "}
      to populate this section — or run the seed migration in{" "}
      <code className="rounded bg-muted px-1.5 py-0.5">supabase/migrations</code>.
    </div>
  );
}
