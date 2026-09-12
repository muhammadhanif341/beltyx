"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function ProductRowActions({ productId }: { productId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Product deleted");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="icon-sm" render={<Link href={`/admin/products/${productId}/edit`} />}>
        <Pencil className="size-3.5" />
      </Button>
      <Button variant="ghost" size="icon-sm" onClick={handleDelete}>
        <Trash2 className="size-3.5 text-destructive" />
      </Button>
    </div>
  );
}
