"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function CouponDeleteButton({ couponId }: { couponId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this coupon?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("coupons").delete().eq("id", couponId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Coupon deleted");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="icon-sm" onClick={handleDelete}>
      <Trash2 className="size-3.5 text-destructive" />
    </Button>
  );
}
