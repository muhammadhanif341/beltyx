"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function AddressDeleteButton({ addressId }: { addressId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this address?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("addresses").delete().eq("id", addressId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Address deleted");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="icon-sm" onClick={handleDelete} aria-label="Delete address">
      <Trash2 className="size-3.5 text-destructive" />
    </Button>
  );
}
