import type { Metadata } from "next";
import { ProfileForm } from "@/components/site/profile-form";
import { SignInPrompt } from "@/components/site/sign-in-prompt";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export const metadata: Metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return <SignInPrompt next="/account/profile" />;

  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  return <ProfileForm profile={profile as Profile | null} email={user.email ?? ""} />;
}
