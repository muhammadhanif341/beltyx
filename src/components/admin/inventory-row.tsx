"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function InventoryStockInput({
  table,
  id,
  initialStock,
}: {
  table: "products" | "product_variants";
  id: string;
  initialStock: number;
}) {
  const [value, setValue] = React.useState(initialStock);
  const router = useRouter();

  async function handleBlur() {
    if (value === initialStock) return;
    const supabase = createClient();
    const { error } = await supabase.from(table).update({ stock: value }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Stock updated");
    router.refresh();
  }

  return (
    <Input
      type="number"
      value={value}
      onChange={(e) => setValue(Number(e.target.value))}
      onBlur={handleBlur}
      className="h-8 w-20"
    />
  );
}
