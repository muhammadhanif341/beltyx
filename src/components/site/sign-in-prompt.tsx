import Link from "next/link";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignInPrompt({
  title = "Sign in to continue",
  description = "You need an account to view this page.",
  next,
}: {
  title?: string;
  description?: string;
  next?: string;
}) {
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";
  const signupHref = next ? `/signup?next=${encodeURIComponent(next)}` : "/signup";

  return (
    <div className="flex flex-col items-center rounded-3xl bg-card p-12 text-center ring-1 ring-border">
      <LogIn className="size-10 text-muted-foreground" />
      <h2 className="mt-5 font-display text-2xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      <div className="mt-6 flex gap-3">
        <Button variant="hero" render={<Link href={loginHref} />}>
          Sign In
        </Button>
        <Button variant="outline" render={<Link href={signupHref} />}>
          Create Account
        </Button>
      </div>
    </div>
  );
}
