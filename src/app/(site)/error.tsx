"use client";

import * as React from "react";
import Link from "next/link";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Storefront error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:py-32">
      <TriangleAlert className="size-12 text-destructive" />
      <h1 className="mt-6 font-display text-2xl font-semibold sm:text-3xl">Something went wrong</h1>
      <p className="mt-3 text-sm text-muted-foreground sm:text-base">
        We hit a snag loading this page — likely a temporary connection issue. Please try again.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button variant="hero" size="lg" onClick={reset}>
          <RefreshCw className="size-4" />
          Try Again
        </Button>
        <Button variant="outline" size="lg" render={<Link href="/" />}>
          Back to Home
        </Button>
      </div>
    </div>
  );
}
