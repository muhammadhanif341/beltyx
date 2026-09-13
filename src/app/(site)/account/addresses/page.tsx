import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { AddressFormDialog } from "@/components/site/address-form-dialog";
import { AddressDeleteButton } from "@/components/site/address-delete-button";
import { SignInPrompt } from "@/components/site/sign-in-prompt";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Address } from "@/lib/types";

export const metadata: Metadata = { title: "My Addresses" };

export default async function AddressesPage() {
  const user = await getCurrentUser();
  if (!user) return <SignInPrompt next="/account/addresses" />;

  const supabase = await createClient();
  const { data } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });
  const addresses = (data ?? []) as Address[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold">Saved Addresses</h2>
        <AddressFormDialog userId={user.id} />
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl bg-card p-12 text-center ring-1 ring-border">
          <MapPin className="size-10 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">
            No saved addresses yet. Add one to speed up checkout next time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <div key={address.id} className="rounded-2xl border border-border p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    {address.full_name}
                    {address.is_default && (
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                        Default
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{address.phone}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ""}, {address.city}
                    {address.state ? `, ${address.state}` : ""} {address.postal_code}, {address.country}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <AddressFormDialog address={address} userId={user.id} />
                  <AddressDeleteButton addressId={address.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
