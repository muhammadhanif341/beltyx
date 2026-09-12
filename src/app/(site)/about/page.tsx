import type { Metadata } from "next";
import Link from "next/link";
import { Award, Hammer, Leaf, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerGrid, StaggerItem } from "@/components/site/fade-in";

export const metadata: Metadata = {
  title: "About Us",
  description: "The story behind Beltyx — premium full-grain leather wallets and belts.",
};

const VALUES = [
  {
    icon: Leaf,
    title: "Honest Materials",
    description: "Only full-grain and vegetable-tanned leather — no bonded leather, no shortcuts.",
  },
  {
    icon: Hammer,
    title: "Built to Last",
    description: "Hand-cut and hand-stitched by small workshops we've worked with for years.",
  },
  {
    icon: Award,
    title: "Backed by Us",
    description: "Every piece ships with a 2-year craftsmanship guarantee.",
  },
  {
    icon: Users,
    title: "Made for Everyday",
    description: "Designed to be carried daily, not admired from a shelf.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-[#1a140f] py-20 text-[#f3ede1] sm:py-28">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <FadeIn>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#e8c77a] uppercase">Our Story</p>
            <h1 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
              Leather goods built for the long run.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-[#f3ede1]/75">
              Beltyx started with a simple frustration: most &quot;premium&quot; wallets and belts
              fell apart within a year. We set out to make leather goods that actually earn their
              price — full-grain leather, honest construction, and a patina that gets better with
              every year you carry it.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <FadeIn>
          <h2 className="font-display text-3xl font-semibold">Why We Started Beltyx</h2>
          <p className="mt-4 text-muted-foreground">
            We spent years buying wallets and belts that looked great in the store and fell apart
            within months — peeling coatings, cracked edges, stitching that gave out. So we
            partnered directly with small, experienced leather workshops, cut out the middlemen,
            and built a small catalog of pieces we&apos;d actually want to carry for a decade.
          </p>
          <p className="mt-4 text-muted-foreground">
            Every Beltyx piece is cut from full-grain or vegetable-tanned leather, finished by
            hand, and tested for daily use before it ever reaches our shop. No coatings hiding
            weak leather, no glued edges — just materials and construction built to age well.
          </p>
        </FadeIn>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <FadeIn>
          <h2 className="text-center font-display text-3xl font-semibold">What We Stand For</h2>
        </FadeIn>
        <StaggerGrid className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value) => (
            <StaggerItem key={value.title}>
              <div className="flex h-full flex-col items-start gap-3 rounded-3xl bg-card p-6 ring-1 ring-border">
                <span className="flex size-11 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <value.icon className="size-5" />
                </span>
                <p className="font-display text-lg font-semibold">{value.title}</p>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-20 text-center sm:px-6">
        <FadeIn>
          <h2 className="font-display text-3xl font-semibold">Carry something that lasts.</h2>
          <p className="mt-3 text-muted-foreground">
            Browse the full collection of wallets, belts, and accessories.
          </p>
          <Button variant="hero" size="xl" className="mt-6" render={<Link href="/shop" />}>
            Shop Beltyx
          </Button>
        </FadeIn>
      </section>
    </div>
  );
}
