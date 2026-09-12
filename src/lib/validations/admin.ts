import { z } from "zod";

export const productFormSchema = z.object({
  name: z.string().min(2, "Enter a product name."),
  slug: z
    .string()
    .min(2, "Enter a URL slug.")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only."),
  categoryId: z.string().nullable(),
  description: z.string().optional(),
  careInstructions: z.string().optional(),
  material: z.string().optional(),
  sku: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be 0 or more."),
  compareAtPrice: z.coerce.number().min(0).optional().nullable(),
  stock: z.coerce.number().int().min(0),
  status: z.enum(["active", "draft", "archived"]),
  isFeatured: z.boolean(),
  isNew: z.boolean(),
});
export type ProductFormInput = z.infer<typeof productFormSchema>;
export type ProductFormRaw = z.input<typeof productFormSchema>;

export const categoryFormSchema = z.object({
  name: z.string().min(2, "Enter a category name."),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only."),
  description: z.string().optional(),
  icon: z.string().optional(),
});
export type CategoryFormInput = z.infer<typeof categoryFormSchema>;

export const couponFormSchema = z.object({
  code: z.string().min(3, "Enter a coupon code."),
  description: z.string().optional(),
  discountType: z.enum(["percent", "fixed"]),
  discountValue: z.coerce.number().min(0),
  minOrderAmount: z.coerce.number().min(0),
  isActive: z.boolean(),
});
export type CouponFormInput = z.infer<typeof couponFormSchema>;
export type CouponFormRaw = z.input<typeof couponFormSchema>;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
