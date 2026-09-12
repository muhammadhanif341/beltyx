"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function CategoryDeleteButton({ categoryId }: { categoryId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this category? Products keep their data but lose this category.")) return;
    const supabase = createClient();
    const { error } = await supabase.from("categories").delete().eq("id", categoryId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Category deleted");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="icon-sm" onClick={handleDelete}>
      <Trash2 className="size-3.5 text-destructive" />
    </Button>
  );
}
