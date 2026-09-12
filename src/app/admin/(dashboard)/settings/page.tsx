import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/settings-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("store_settings").select("*").eq("id", true).maybeSingle();

  const settings = data ?? {
    store_name: "Beltyx",
    support_email: "support@beltyx.com",
    free_shipping_threshold: 75,
    flat_shipping_fee: 8,
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Store configuration</p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  );
}
