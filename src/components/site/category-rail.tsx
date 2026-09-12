import Link from "next/link";
import { CategoryIcon } from "@/components/site/category-icon";
import type { Category } from "@/lib/types";

export function CategoryRail({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <div className="no-scrollbar flex gap-4 overflow-x-auto px-4 pb-2 sm:justify-center sm:px-0">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/category/${category.slug}`}
          className="group flex w-20 shrink-0 flex-col items-center gap-2.5 sm:w-24"
        >
          <span className="flex size-16 items-center justify-center rounded-full bg-card text-foreground ring-1 ring-border transition-all duration-300 group-hover:ring-2 group-hover:ring-accent sm:size-20">
            <CategoryIcon name={category.icon} className="size-6 text-accent sm:size-7" />
          </span>
          <span className="text-center text-xs font-medium text-foreground/80 group-hover:text-accent sm:text-sm">
            {category.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
