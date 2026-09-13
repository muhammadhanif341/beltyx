"use client";

import { useRouter } from "next/navigation";
import { Check, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function ReviewActions({ reviewId, isApproved }: { reviewId: string; isApproved: boolean }) {
  const router = useRouter();
  const supabase = createClient();

  async function setApproved(value: boolean) {
    const { error } = await supabase.from("reviews").update({ is_approved: value }).eq("id", reviewId);
    if (error) return toast.error(error.message);
    toast.success(value ? "Review approved" : "Review hidden");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this review? This cannot be undone.")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
    if (error) return toast.error(error.message);
    toast.success("Review deleted");
    router.refresh();
  }

  return (
    <div className="flex justify-end gap-1">
      {isApproved ? (
        <Button variant="ghost" size="icon-sm" onClick={() => setApproved(false)} aria-label="Hide">
          <EyeOff className="size-3.5 text-muted-foreground" />
        </Button>
      ) : (
        <Button variant="ghost" size="icon-sm" onClick={() => setApproved(true)} aria-label="Approve">
          <Check className="size-3.5 text-accent" />
        </Button>
      )}
      <Button variant="ghost" size="icon-sm" onClick={handleDelete} aria-label="Delete">
        <Trash2 className="size-3.5 text-destructive" />
      </Button>
    </div>
  );
}
