import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFoundContent() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:py-32">
      <p className="font-display text-7xl font-semibold text-accent sm:text-8xl">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold sm:text-3xl">Page not found</h1>
      <p className="mt-3 text-sm text-muted-foreground sm:text-base">
        The page you&apos;re looking for doesn&apos;t exist, may have been moved, or the product is no
        longer available.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button variant="hero" size="lg" render={<Link href="/" />}>
          <Home className="size-4" />
          Back to Home
        </Button>
        <Button variant="outline" size="lg" render={<Link href="/shop" />}>
          <Compass className="size-4" />
          Browse Shop
        </Button>
      </div>
    </div>
  );
}
