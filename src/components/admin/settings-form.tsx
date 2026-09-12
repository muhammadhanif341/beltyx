"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface StoreSettings {
  store_name: string;
  support_email: string | null;
  free_shipping_threshold: number;
  flat_shipping_fee: number;
}

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const router = useRouter();
  const [form, setForm] = React.useState(settings);
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("store_settings")
      .update({
        store_name: form.store_name,
        support_email: form.support_email,
        free_shipping_threshold: form.free_shipping_threshold,
        flat_shipping_fee: form.flat_shipping_fee,
      })
      .eq("id", true);
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Settings saved");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4 rounded-2xl bg-card p-6 ring-1 ring-border">
      <div>
        <Label htmlFor="store_name">Store Name</Label>
        <Input
          id="store_name"
          className="mt-1.5"
          value={form.store_name}
          onChange={(e) => setForm((f) => ({ ...f, store_name: e.target.value }))}
        />
      </div>
      <div>
        <Label htmlFor="support_email">Support Email</Label>
        <Input
          id="support_email"
          type="email"
          className="mt-1.5"
          value={form.support_email ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, support_email: e.target.value }))}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="free_shipping_threshold">Free Shipping Over ($)</Label>
          <Input
            id="free_shipping_threshold"
            type="number"
            className="mt-1.5"
            value={form.free_shipping_threshold}
            onChange={(e) => setForm((f) => ({ ...f, free_shipping_threshold: Number(e.target.value) }))}
          />
        </div>
        <div>
          <Label htmlFor="flat_shipping_fee">Flat Shipping Fee ($)</Label>
          <Input
            id="flat_shipping_fee"
            type="number"
            className="mt-1.5"
            value={form.flat_shipping_fee}
            onChange={(e) => setForm((f) => ({ ...f, flat_shipping_fee: Number(e.target.value) }))}
          />
        </div>
      </div>
      <Button type="submit" variant="hero" size="lg" className="mt-2 self-start" disabled={submitting}>
        {submitting ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
}
