import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  hrefLabel = "View all",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  hrefLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end", className)}>
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">{eyebrow}</p>
        )}
        <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">{title}</h2>
        {description && <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">{description}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-accent hover:underline"
        >
          {hrefLabel}
          <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  );
}
