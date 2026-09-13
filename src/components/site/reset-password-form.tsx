"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import { toast } from "sonner";

export function ResetPasswordForm() {
  const [submitting, setSubmitting] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });

  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setReady(Boolean(data.session)));
  }, []);

  async function onSubmit(data: ResetPasswordInput) {
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: data.password });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated. You're signed in.");
    router.push("/account");
  }

  if (!ready) {
    return (
      <div className="rounded-3xl bg-card p-8 text-center ring-1 ring-border">
        <h1 className="font-display text-2xl font-semibold">Reset link required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Open this page from the password reset link we emailed you.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-card p-8 ring-1 ring-border">
      <h1 className="font-display text-3xl font-semibold">Set a New Password</h1>
      <p className="mt-1 text-sm text-muted-foreground">Choose a new password for your account.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
        <div>
          <Label htmlFor="password">New Password</Label>
          <Input id="password" type="password" className="mt-1.5" {...register("password")} />
          {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input id="confirmPassword" type="password" className="mt-1.5" {...register("confirmPassword")} />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>
        <Button type="submit" variant="hero" size="xl" className="mt-2" disabled={submitting}>
          {submitting ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </div>
  );
}
