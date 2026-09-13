"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import {
  productFormSchema,
  slugify,
  type ProductFormInput,
  type ProductFormRaw,
} from "@/lib/validations/admin";
import type { Category, ProductVariant, ProductImage } from "@/lib/types";
import { toast } from "sonner";

interface VariantRow {
  id: string;
  size: string;
  color: string;
  colorHex: string;
  sku: string;
  priceOverride: string;
  stock: number;
}

interface SpecRow {
  id: string;
  key: string;
  value: string;
}

export function ProductForm({
  categories,
  mode,
  productId,
  defaultValues,
  defaultImages = [],
  defaultVariants = [],
  defaultSpecifications = {},
}: {
  categories: Category[];
  mode: "create" | "edit";
  productId?: string;
  defaultValues?: Partial<ProductFormRaw>;
  defaultImages?: ProductImage[];
  defaultVariants?: ProductVariant[];
  defaultSpecifications?: Record<string, string>;
}) {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);
  const [submitting, setSubmitting] = React.useState(false);
  const [images, setImages] = React.useState<{ url: string; uploading?: boolean }[]>(
    defaultImages.map((i) => ({ url: i.url })),
  );
  const [variants, setVariants] = React.useState<VariantRow[]>(
    defaultVariants.map((v) => ({
      id: v.id,
      size: v.size ?? "",
      color: v.color ?? "",
      colorHex: v.color_hex ?? "#241a12",
      sku: v.sku ?? "",
      priceOverride: v.price_override != null ? String(v.price_override) : "",
      stock: v.stock,
    })),
  );
  const [specs, setSpecs] = React.useState<SpecRow[]>(
    Object.entries(defaultSpecifications).map(([key, value]) => ({ id: crypto.randomUUID(), key, value })),
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormRaw, unknown, ProductFormInput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      status: "active",
      isFeatured: false,
      isNew: false,
      stock: 0,
      lowStockThreshold: 5,
      price: 0,
      categoryId: null,
      ...defaultValues,
    },
  });

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    for (const file of files) {
      const path = `${crypto.randomUUID()}-${file.name}`;
      setImages((prev) => [...prev, { url: "", uploading: true }]);
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (error) {
        toast.error(`Failed to upload ${file.name}: ${error.message}`);
        setImages((prev) => prev.filter((img) => !img.uploading));
        continue;
      }
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setImages((prev) => {
        const next = [...prev];
        const idx = next.findIndex((img) => img.uploading);
        if (idx !== -1) next[idx] = { url: data.publicUrl };
        return next;
      });
    }
    e.target.value = "";
  }

  function addVariant() {
    setVariants((prev) => [
      ...prev,
      { id: crypto.randomUUID(), size: "", color: "", colorHex: "#241a12", sku: "", priceOverride: "", stock: 0 },
    ]);
  }

  function addSpec() {
    setSpecs((prev) => [...prev, { id: crypto.randomUUID(), key: "", value: "" }]);
  }

  async function onSubmit(data: ProductFormInput) {
    setSubmitting(true);

    const payload = {
      name: data.name,
      slug: data.slug,
      category_id: data.categoryId || null,
      description: data.description || null,
      care_instructions: data.careInstructions || null,
      material: data.material || null,
      sku: data.sku || null,
      price: data.price,
      compare_at_price: data.compareAtPrice || null,
      stock: data.stock,
      low_stock_threshold: data.lowStockThreshold,
      status: data.status,
      is_featured: data.isFeatured,
      is_new: data.isNew,
      specifications: Object.fromEntries(
        specs.filter((s) => s.key.trim()).map((s) => [s.key.trim(), s.value.trim()]),
      ),
    };

    let id = productId;

    if (mode === "create") {
      const { data: created, error } = await supabase.from("products").insert(payload).select("id").single();
      if (error || !created) {
        setSubmitting(false);
        toast.error(error?.message ?? "Failed to create product.");
        return;
      }
      id = created.id;
    } else {
      const { error } = await supabase.from("products").update(payload).eq("id", id);
      if (error) {
        setSubmitting(false);
        toast.error(error.message);
        return;
      }
      await supabase.from("product_images").delete().eq("product_id", id!);
      await supabase.from("product_variants").delete().eq("product_id", id!);
    }

    if (images.length > 0) {
      await supabase.from("product_images").insert(
        images
          .filter((img) => img.url)
          .map((img, i) => ({ product_id: id, url: img.url, sort_order: i })),
      );
    }

    if (variants.length > 0) {
      await supabase.from("product_variants").insert(
        variants.map((v) => ({
          product_id: id,
          size: v.size || null,
          color: v.color || null,
          color_hex: v.color ? v.colorHex : null,
          sku: v.sku || null,
          price_override: v.priceOverride ? Number(v.priceOverride) : null,
          stock: v.stock,
        })),
      );
    }

    setSubmitting(false);
    toast.success(mode === "create" ? "Product created" : "Product updated");
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-6">
        <section className="rounded-2xl bg-card p-5 ring-1 ring-border">
          <h2 className="font-display text-lg font-semibold">Basic Information</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                className="mt-1.5"
                {...register("name")}
                onBlur={(e) => {
                  if (!watch("slug")) setValue("slug", slugify(e.target.value));
                }}
              />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input id="slug" className="mt-1.5" {...register("slug")} />
              {errors.slug && <p className="mt-1 text-xs text-destructive">{errors.slug.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={4} className="mt-1.5" {...register("description")} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="careInstructions">Care Instructions</Label>
              <Textarea id="careInstructions" rows={3} className="mt-1.5" {...register("careInstructions")} />
            </div>
            <div>
              <Label htmlFor="material">Material</Label>
              <Input id="material" className="mt-1.5" {...register("material")} />
            </div>
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" className="mt-1.5" {...register("sku")} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-card p-5 ring-1 ring-border">
          <h2 className="font-display text-lg font-semibold">Pricing & Stock</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input id="price" type="number" step="0.01" className="mt-1.5" {...register("price")} />
              {errors.price && <p className="mt-1 text-xs text-destructive">{errors.price.message}</p>}
            </div>
            <div>
              <Label htmlFor="compareAtPrice">Sale / Compare-at Price ($)</Label>
              <Input id="compareAtPrice" type="number" step="0.01" className="mt-1.5" {...register("compareAtPrice")} />
            </div>
            <div>
              <Label htmlFor="stock">Base Stock</Label>
              <Input id="stock" type="number" className="mt-1.5" {...register("stock")} />
            </div>
            <div>
              <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
              <Input id="lowStockThreshold" type="number" className="mt-1.5" {...register("lowStockThreshold")} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-card p-5 ring-1 ring-border">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Specifications</h2>
            <Button type="button" variant="outline" size="sm" onClick={addSpec}>
              <Plus className="size-3.5" data-icon="inline-start" />
              Add Spec
            </Button>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {specs.map((spec, i) => (
              <div key={spec.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <Input
                  placeholder="Key (e.g. Dimensions)"
                  value={spec.key}
                  onChange={(e) => setSpecs((prev) => prev.map((s, idx) => (idx === i ? { ...s, key: e.target.value } : s)))}
                />
                <Input
                  placeholder="Value (e.g. 4.5 x 3.5 in)"
                  value={spec.value}
                  onChange={(e) => setSpecs((prev) => prev.map((s, idx) => (idx === i ? { ...s, value: e.target.value } : s)))}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => setSpecs((prev) => prev.filter((_, idx) => idx !== i))}>
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            ))}
            {specs.length === 0 && (
              <p className="text-sm text-muted-foreground">No specifications added yet.</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-card p-5 ring-1 ring-border">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Variants</h2>
            <Button type="button" variant="outline" size="sm" onClick={addVariant}>
              <Plus className="size-3.5" data-icon="inline-start" />
              Add Variant
            </Button>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {variants.map((variant, i) => (
              <div key={variant.id} className="grid grid-cols-2 gap-2 rounded-xl border border-border p-3 sm:grid-cols-7">
                <Input
                  placeholder="Size (e.g. 32)"
                  value={variant.size}
                  onChange={(e) =>
                    setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, size: e.target.value } : v)))
                  }
                />
                <Input
                  placeholder="Color name"
                  value={variant.color}
                  onChange={(e) =>
                    setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, color: e.target.value } : v)))
                  }
                />
                <Input
                  type="color"
                  value={variant.colorHex}
                  className="p-1"
                  onChange={(e) =>
                    setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, colorHex: e.target.value } : v)))
                  }
                />
                <Input
                  placeholder="SKU"
                  value={variant.sku}
                  onChange={(e) =>
                    setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, sku: e.target.value } : v)))
                  }
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Price override"
                  value={variant.priceOverride}
                  onChange={(e) =>
                    setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, priceOverride: e.target.value } : v)))
                  }
                />
                <Input
                  type="number"
                  placeholder="Stock"
                  value={variant.stock}
                  onChange={(e) =>
                    setVariants((prev) =>
                      prev.map((v, idx) => (idx === i ? { ...v, stock: Number(e.target.value) } : v)),
                    )
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setVariants((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            ))}
            {variants.length === 0 && (
              <p className="text-sm text-muted-foreground">No variants — product uses base price/stock only.</p>
            )}
          </div>
        </section>
      </div>

      <div className="flex flex-col gap-6">
        <section className="rounded-2xl bg-card p-5 ring-1 ring-border">
          <h2 className="font-display text-lg font-semibold">Organize</h2>
          <div className="mt-4 flex flex-col gap-4">
            <div>
              <Label>Category</Label>
              <Select
                value={watch("categoryId") ?? undefined}
                onValueChange={(v) => setValue("categoryId", v)}
              >
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={watch("status")} onValueChange={(v) => setValue("status", v as ProductFormInput["status"])}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={watch("isFeatured")} onCheckedChange={(v) => setValue("isFeatured", Boolean(v))} />
              Featured product
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={watch("isNew")} onCheckedChange={(v) => setValue("isNew", Boolean(v))} />
              Mark as new arrival
            </label>
          </div>
        </section>

        <section className="rounded-2xl bg-card p-5 ring-1 ring-border">
          <h2 className="font-display text-lg font-semibold">Images</h2>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                {img.uploading ? (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">...</div>
                ) : (
                  <>
                    <Image src={img.url} alt="" fill sizes="120px" className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white"
                    >
                      <X className="size-3" />
                    </button>
                  </>
                )}
              </div>
            ))}
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground hover:border-accent hover:text-accent">
              <Upload className="size-5" />
              <span className="text-xs">Upload</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Uploaded to the <code>product-images</code> Supabase Storage bucket.
          </p>
        </section>

        <Button type="submit" variant="hero" size="xl" disabled={submitting}>
          {submitting ? "Saving..." : mode === "create" ? "Create Product" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
