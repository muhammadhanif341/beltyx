import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/types";

const FEATURED_SLUGS = ["wallets", "belts", "card-holders", "gift-sets"];

const PLACEHOLDER_TONES: Record<string, string> = {
  wallets: "2a1f16/e8c77a",
  belts: "1c1512/c9a24b",
  "card-holders": "241a12/d9b568",
  "gift-sets": "171310/c9a24b",
};

export function CategoryShowcase({ categories }: { categories: Category[] }) {
  const featured = FEATURED_SLUGS.map((slug) => categories.find((c) => c.slug === slug)).filter(
    (c): c is Category => Boolean(c),
  );

  if (featured.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
      {featured.map((category) => (
        <Link
          key={category.id}
          href={`/category/${category.slug}`}
          className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-3xl ring-1 ring-border"
        >
          <Image
            src={
              category.image_url ??
              `https://placehold.co/600x800/${PLACEHOLDER_TONES[category.slug] ?? "1c1512/c9a24b"}?text=${encodeURIComponent(category.name)}`
            }
            alt={category.name}
            fill
            sizes="(min-width: 1024px) 22vw, 45vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition-opacity duration-300 group-hover:from-black/80" />
          <div className="relative p-4 sm:p-5">
            <p className="font-display text-lg font-semibold text-white sm:text-xl">{category.name}</p>
            <span className="mt-1 inline-block text-xs font-medium tracking-wide text-white/80 uppercase transition-transform duration-300 group-hover:translate-x-1">
              Shop now &rarr;
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
