"use server";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function subscribeToNewsletter(email: string): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "Newsletter signup is unavailable right now." };
  }
  const trimmed = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { ok: false, message: "Enter a valid email address." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("newsletter_subscribers").insert({ email: trimmed });

  if (error) {
    if (error.code === "23505") {
      return { ok: true, message: "You're already on the list!" };
    }
    return { ok: false, message: "Couldn't subscribe right now. Try again." };
  }
  return { ok: true, message: "Welcome to the club! Check your inbox for a confirmation." };
}
