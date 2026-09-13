"use client";

import * as React from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GuestCheckoutBanner() {
  const [dismissed, setDismissed] = React.useState(false);
  if (dismissed) return null;

  return (
    <div className="mt-6 flex flex-col items-start gap-3 rounded-3xl bg-card p-5 ring-1 ring-border sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-display text-lg font-semibold">Have a Beltyx account?</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in for faster checkout, or continue below as a guest — no account required.
        </p>
      </div>
      <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto">
        <Button variant="outline" render={<Link href="/login?next=/checkout" />}>
          Log In
        </Button>
        <Button variant="outline" render={<Link href="/signup?next=/checkout" />}>
          Create Account
        </Button>
        <Button variant="ghost" onClick={() => setDismissed(true)}>
          Continue as Guest
          <X className="size-3.5" data-icon="inline-end" />
        </Button>
      </div>
    </div>
  );
}
