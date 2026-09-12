"use server";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { contactFormSchema, type ContactFormInput } from "@/lib/validations/checkout";

export async function submitContactMessage(
  input: ContactFormInput,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const parsed = contactFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Please fill out all fields correctly." };
  }
  if (!isSupabaseConfigured) {
    return { ok: false, message: "This form isn't connected yet. Email us directly instead." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject,
    message: parsed.data.message,
  });

  if (error) {
    console.error("Contact message failed:", error);
    return { ok: false, message: "Couldn't send your message. Please try again." };
  }
  return { ok: true };
}
