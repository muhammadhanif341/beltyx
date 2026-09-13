import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type {
  Category,
  Coupon,
  ProductWithRelations,
  Review,
} from "@/lib/types";

const PRODUCT_SELECT =
  "*, category:categories(*), images:product_images(*), variants:product_variants(*)";

/** Every catalog read degrades to an empty result instead of throwing when
 * Supabase isn't configured yet, so the storefront still renders. */
async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!isSupabaseConfigured) return fallback;
  try {
    return await fn();
  } catch (error) {
    console.error("Supabase query failed:", error);
    return fallback;
  }
}

export async function getCategories(): Promise<Category[]> {
  return safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Category[];
  }, []);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return (data as Category) ?? null;
  }, null);
}

export async function getFeaturedProducts(limit = 8): Promise<ProductWithRelations[]> {
  return safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("status", "active")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as unknown as ProductWithRelations[];
  }, []);
}

export async function getNewProducts(limit = 8): Promise<ProductWithRelations[]> {
  return safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("status", "active")
      .eq("is_new", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as unknown as ProductWithRelations[];
  }, []);
}

export interface ProductFilters {
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  inStockOnly?: boolean;
  minRating?: number;
  sort?: "featured" | "newest" | "price-asc" | "price-desc" | "rating" | "best-selling";
  page?: number;
  pageSize?: number;
}

export async function getProducts(
  filters: ProductFilters = {},
): Promise<{ products: ProductWithRelations[]; total: number }> {
  return safeQuery(async () => {
    const supabase = await createClient();
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 12;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("products")
      .select(PRODUCT_SELECT, { count: "exact" })
      .eq("status", "active");

    if (filters.categorySlug) {
      const category = await getCategoryBySlug(filters.categorySlug);
      if (category) query = query.eq("category_id", category.id);
    }
    if (filters.minPrice != null) query = query.gte("price", filters.minPrice);
    if (filters.maxPrice != null) query = query.lte("price", filters.maxPrice);
    if (filters.inStockOnly) query = query.gt("stock", 0);
    if (filters.minRating != null) query = query.gte("rating_avg", filters.minRating);
    if (filters.size) {
      const { data: matches } = await supabase
        .from("product_variants")
        .select("product_id")
        .eq("size", filters.size);
      const ids = (matches ?? []).map((m) => m.product_id);
      query = query.in("id", ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"]);
    }
    if (filters.color) {
      const { data: matches } = await supabase
        .from("product_variants")
        .select("product_id")
        .eq("color", filters.color);
      const ids = (matches ?? []).map((m) => m.product_id);
      query = query.in("id", ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"]);
    }

    switch (filters.sort) {
      case "featured":
        query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
        break;
      case "price-asc":
        query = query.order("price", { ascending: true });
        break;
      case "price-desc":
        query = query.order("price", { ascending: false });
        break;
      case "rating":
        query = query.order("rating_avg", { ascending: false });
        break;
      case "best-selling":
        query = query.order("sales_count", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;
    return {
      products: (data ?? []) as unknown as ProductWithRelations[],
      total: count ?? 0,
    };
  }, { products: [], total: 0 });
}

export async function getFilterOptions(): Promise<{ sizes: string[]; colors: string[] }> {
  return safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase.from("product_variants").select("size, color");
    if (error) throw error;
    const sizes = Array.from(new Set((data ?? []).map((v) => v.size).filter(Boolean))) as string[];
    const colors = Array.from(new Set((data ?? []).map((v) => v.color).filter(Boolean))) as string[];
    return { sizes: sizes.sort(), colors: colors.sort() };
  }, { sizes: [], colors: [] });
}

export async function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  return safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return (data as unknown as ProductWithRelations) ?? null;
  }, null);
}

export async function getRelatedProducts(
  categoryId: string | null,
  excludeProductId: string,
  limit = 4,
): Promise<ProductWithRelations[]> {
  return safeQuery(async () => {
    if (!categoryId) return [];
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("status", "active")
      .eq("category_id", categoryId)
      .neq("id", excludeProductId)
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as unknown as ProductWithRelations[];
  }, []);
}

export async function searchProducts(term: string): Promise<ProductWithRelations[]> {
  return safeQuery(async () => {
    const trimmed = term.trim();
    if (!trimmed) return [];
    const supabase = await createClient();

    const matchingCategoryIds = (
      await supabase.from("categories").select("id").ilike("name", `%${trimmed}%`)
    ).data?.map((c) => c.id) ?? [];

    const orClauses = [
      `name.ilike.%${trimmed}%`,
      `description.ilike.%${trimmed}%`,
      `material.ilike.%${trimmed}%`,
      `tags.cs.{${trimmed}}`,
    ];
    if (matchingCategoryIds.length > 0) {
      orClauses.push(`category_id.in.(${matchingCategoryIds.join(",")})`);
    }

    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("status", "active")
      .or(orClauses.join(","))
      .limit(24);
    if (error) throw error;
    return (data ?? []) as unknown as ProductWithRelations[];
  }, []);
}

export async function searchProductSuggestions(term: string, limit = 6): Promise<ProductWithRelations[]> {
  return safeQuery(async () => {
    const trimmed = term.trim();
    if (trimmed.length < 2) return [];
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("status", "active")
      .ilike("name", `%${trimmed}%`)
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as unknown as ProductWithRelations[];
  }, []);
}

/** Fire-and-forget analytics counter — never blocks or fails the product page. */
export async function trackProductView(productId: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const supabase = await createClient();
    await supabase.rpc("increment_product_view", { p_product_id: productId });
  } catch (error) {
    console.error("Product view tracking failed:", error);
  }
}

export async function getMostViewedProducts(limit = 5): Promise<ProductWithRelations[]> {
  return safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .gt("view_count", 0)
      .order("view_count", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as unknown as ProductWithRelations[];
  }, []);
}

export async function getApprovedReviews(productId: string): Promise<Review[]> {
  return safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("*, profile:profiles(full_name, avatar_url)")
      .eq("product_id", productId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as Review[];
  }, []);
}

export async function validateCoupon(
  code: string,
  subtotal: number,
  productIds: string[] = [],
): Promise<{ ok: true; coupon: Coupon } | { ok: false; message: string }> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "Coupons are unavailable right now." };
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .ilike("code", code)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw error;
    if (!data) return { ok: false, message: "That coupon code isn't valid." };

    const coupon = data as Coupon;
    const now = new Date();
    if (coupon.starts_at && new Date(coupon.starts_at) > now) {
      return { ok: false, message: "This coupon isn't active yet." };
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < now) {
      return { ok: false, message: "This coupon has expired." };
    }
    if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses) {
      return { ok: false, message: "This coupon has reached its usage limit." };
    }
    if (subtotal < coupon.min_order_amount) {
      return {
        ok: false,
        message: `Add $${coupon.min_order_amount.toFixed(2)} more to use this coupon.`,
      };
    }
    if (coupon.product_id && !productIds.includes(coupon.product_id)) {
      return { ok: false, message: "This coupon only applies to a specific product." };
    }
    if (coupon.category_id) {
      const { data: matches } = await supabase
        .from("products")
        .select("id")
        .eq("category_id", coupon.category_id)
        .in("id", productIds.length > 0 ? productIds : ["00000000-0000-0000-0000-000000000000"]);
      if (!matches || matches.length === 0) {
        return { ok: false, message: "This coupon only applies to a specific category." };
      }
    }
    return { ok: true, coupon };
  } catch (error) {
    console.error("Coupon validation failed:", error);
    return { ok: false, message: "Couldn't validate that coupon. Try again." };
  }
}

export function computeDiscount(coupon: Coupon, subtotal: number): number {
  if (coupon.discount_type === "percent") {
    return Math.round(((subtotal * coupon.discount_value) / 100) * 100) / 100;
  }
  return Math.min(coupon.discount_value, subtotal);
}
