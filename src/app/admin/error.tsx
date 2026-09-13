"use client";

import * as React from "react";
import Link from "next/link";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <TriangleAlert className="size-12 text-destructive" />
      <h1 className="mt-6 font-display text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        This dashboard page failed to load — likely a temporary connection issue with the database.
      </p>
      <div className="mt-8 flex gap-3">
        <Button variant="hero" onClick={reset}>
          <RefreshCw className="size-4" />
          Try Again
        </Button>
        <Button variant="outline" render={<Link href="/admin" />}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
