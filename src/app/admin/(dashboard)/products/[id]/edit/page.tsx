import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { createClient } from "@/lib/supabase/server";
import type { Category, ProductImage, ProductVariant } from "@/lib/types";

export const metadata: Metadata = { title: "Edit Product" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: categories }, { data: product }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase
      .from("products")
      .select("*, images:product_images(*), variants:product_variants(*)")
      .eq("id", id)
      .maybeSingle(),
  ]);

  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-semibold">Edit Product</h1>
      <ProductForm
        categories={(categories ?? []) as Category[]}
        mode="edit"
        productId={product.id}
        defaultValues={{
          name: product.name,
          slug: product.slug,
          categoryId: product.category_id,
          description: product.description ?? "",
          careInstructions: product.care_instructions ?? "",
          material: product.material ?? "",
          sku: product.sku ?? "",
          price: product.price,
          compareAtPrice: product.compare_at_price,
          stock: product.stock,
          status: product.status,
          isFeatured: product.is_featured,
          isNew: product.is_new,
        }}
        defaultImages={(product.images ?? []) as ProductImage[]}
        defaultVariants={(product.variants ?? []) as ProductVariant[]}
      />
    </div>
  );
}
