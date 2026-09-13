"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { profileSchema, type ProfileInput } from "@/lib/validations/auth";
import type { Profile } from "@/lib/types";
import { toast } from "sonner";

export function ProfileForm({ profile, email }: { profile: Profile | null; email: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
    },
  });

  async function onSubmit(data: ProfileInput) {
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: data.fullName, phone: data.phone || null })
      .eq("id", profile?.id);
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't update your profile. Try again.");
      return;
    }
    toast.success("Profile updated.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 rounded-3xl bg-card p-6 ring-1 ring-border">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled className="mt-1.5" />
        <p className="mt-1 text-xs text-muted-foreground">Contact support to change your email.</p>
      </div>
      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <Input id="fullName" className="mt-1.5" {...register("fullName")} />
        {errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName.message}</p>}
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" className="mt-1.5" placeholder="+92 300 1234567" {...register("phone")} />
      </div>
      <Button type="submit" variant="hero" className="self-start" disabled={submitting}>
        {submitting ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
