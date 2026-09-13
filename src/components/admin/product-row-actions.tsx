"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { ProductStatus } from "@/lib/types";
import { toast } from "sonner";

export function ProductRowActions({ productId, status }: { productId: string; status: ProductStatus }) {
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

  async function handleTogglePublish() {
    const supabase = createClient();
    const nextStatus: ProductStatus = status === "active" ? "draft" : "active";
    const { error } = await supabase.from("products").update({ status: nextStatus }).eq("id", productId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(nextStatus === "active" ? "Product published" : "Product unpublished");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleTogglePublish}
        aria-label={status === "active" ? "Unpublish" : "Publish"}
      >
        {status === "active" ? <Eye className="size-3.5 text-accent" /> : <EyeOff className="size-3.5 text-muted-foreground" />}
      </Button>
      <Button variant="ghost" size="icon-sm" render={<Link href={`/admin/products/${productId}/edit`} />}>
        <Pencil className="size-3.5" />
      </Button>
      <Button variant="ghost" size="icon-sm" onClick={handleDelete}>
        <Trash2 className="size-3.5 text-destructive" />
      </Button>
    </div>
  );
}
