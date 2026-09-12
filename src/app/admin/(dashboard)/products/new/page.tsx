import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";

export const metadata: Metadata = { title: "Add Product" };

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("sort_order");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-semibold">Add Product</h1>
      <ProductForm categories={(categories ?? []) as Category[]} mode="create" />
    </div>
  );
}
