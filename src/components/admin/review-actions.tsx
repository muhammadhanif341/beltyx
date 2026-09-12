"use client";

import { useRouter } from "next/navigation";
import { Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function ReviewActions({ reviewId, isApproved }: { reviewId: string; isApproved: boolean }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleApprove() {
    const { error } = await supabase.from("reviews").update({ is_approved: true }).eq("id", reviewId);
    if (error) return toast.error(error.message);
    toast.success("Review approved");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this review?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
    if (error) return toast.error(error.message);
    toast.success("Review deleted");
    router.refresh();
  }

  return (
    <div className="flex justify-end gap-1">
      {!isApproved && (
        <Button variant="ghost" size="icon-sm" onClick={handleApprove} aria-label="Approve">
          <Check className="size-3.5 text-accent" />
        </Button>
      )}
      <Button variant="ghost" size="icon-sm" onClick={handleDelete} aria-label="Delete">
        <Trash2 className="size-3.5 text-destructive" />
      </Button>
    </div>
  );
}
