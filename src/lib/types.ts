// Hand-written mirror of the Supabase schema (supabase/migrations/0001_init.sql).
// Regenerate with `supabase gen types typescript` once the project is linked,
// and this file can be replaced by the generated output.

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned";
export type PaymentMethod = string;
export type PaymentStatus = "unpaid" | "paid" | "refunded";
export type ProductStatus = "active" | "draft" | "archived";
export type DiscountType = "percent" | "fixed";
export type ShippingMethod = "standard" | "express";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  care_instructions: string | null;
  price: number;
  compare_at_price: number | null;
  material: string | null;
  sku: string | null;
  is_featured: boolean;
  is_new: boolean;
  status: ProductStatus;
  stock: number;
  rating_avg: number;
  rating_count: number;
  sales_count: number;
  tags: string[];
  low_stock_threshold: number;
  specifications: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string | null;
  color: string | null;
  color_hex: string | null;
  sku: string | null;
  price_override: number | null;
  stock: number;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt: string | null;
  sort_order: number;
  created_at: string;
}

export interface ProductWithRelations extends Product {
  category?: Category | null;
  images?: ProductImage[];
  variants?: ProductVariant[];
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface CartItemRow {
  id: string;
  user_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  order_number: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  total: number;
  coupon_code: string | null;
  shipping_method: ShippingMethod;
  estimated_delivery: string | null;
  shipping_address: ShippingAddress;
  contact_email: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderStatusHistoryEntry {
  id: string;
  order_id: string;
  status: OrderStatus;
  note: string | null;
  created_at: string;
}

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

export const ORDER_STATUS_VARIANT: Record<OrderStatus, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "secondary",
  confirmed: "outline",
  processing: "outline",
  shipped: "outline",
  out_for_delivery: "outline",
  delivered: "default",
  cancelled: "destructive",
  returned: "destructive",
};

export interface ShippingAddress {
  full_name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  variant_label: string | null;
  unit_price: number;
  quantity: number;
  subtotal: number;
  image_url: string | null;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  order_id: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  is_approved: boolean;
  image_url: string | null;
  created_at: string;
  profile?: Pick<Profile, "full_name" | "avatar_url"> | null;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  category_id: string | null;
  product_id: string | null;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}
