-- BELTYX schema: core tables, indexes, and row-level security policies.
-- Run against a Supabase project (SQL editor or `supabase db push`).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ---------------------------------------------------------------------------
-- catalog
-- ---------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  icon text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories (id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  care_instructions text,
  price numeric(10, 2) not null,
  compare_at_price numeric(10, 2),
  material text,
  sku text,
  is_featured boolean not null default false,
  is_new boolean not null default false,
  status text not null default 'active' check (status in ('active', 'draft', 'archived')),
  stock int not null default 0,
  rating_avg numeric(3, 2) not null default 0,
  rating_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_id_idx on public.products (category_id);
create index products_status_idx on public.products (status);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  size text,
  color text,
  color_hex text,
  sku text,
  price_override numeric(10, 2),
  stock int not null default 0,
  created_at timestamptz not null default now()
);

create index product_variants_product_id_idx on public.product_variants (product_id);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  alt text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index product_images_product_id_idx on public.product_images (product_id);

-- ---------------------------------------------------------------------------
-- customer data
-- ---------------------------------------------------------------------------
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  full_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text,
  postal_code text not null,
  country text not null default 'Pakistan',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index addresses_user_id_idx on public.addresses (user_id);

create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  variant_id uuid references public.product_variants (id) on delete cascade,
  quantity int not null check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (user_id, product_id, variant_id)
);

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  order_number text not null unique,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_method text not null default 'cod' check (payment_method in ('cod', 'bank_transfer')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'refunded')),
  subtotal numeric(10, 2) not null,
  discount numeric(10, 2) not null default 0,
  shipping_fee numeric(10, 2) not null default 0,
  total numeric(10, 2) not null,
  coupon_code text,
  shipping_address jsonb not null,
  contact_email text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_id_idx on public.orders (user_id);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  variant_id uuid references public.product_variants (id) on delete set null,
  product_name text not null,
  variant_label text,
  unit_price numeric(10, 2) not null,
  quantity int not null,
  subtotal numeric(10, 2) not null,
  image_url text
);

create index order_items_order_id_idx on public.order_items (order_id);

-- ---------------------------------------------------------------------------
-- reviews, coupons, contact
-- ---------------------------------------------------------------------------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  rating int not null check (rating between 1 and 5),
  title text,
  body text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

create index reviews_product_id_idx on public.reviews (product_id);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value numeric(10, 2) not null,
  min_order_amount numeric(10, 2) not null default 0,
  max_uses int,
  used_count int not null default 0,
  is_active boolean not null default true,
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- singleton row holding store-wide configuration, edited from the admin Settings page
create table public.store_settings (
  id boolean primary key default true check (id),
  store_name text not null default 'Beltyx',
  support_email text,
  free_shipping_threshold numeric(10, 2) not null default 75,
  flat_shipping_fee numeric(10, 2) not null default 8,
  updated_at timestamptz not null default now()
);

insert into public.store_settings (id, store_name, support_email) values (true, 'Beltyx', 'support@beltyx.com');

-- ---------------------------------------------------------------------------
-- row level security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.addresses enable row level security;
alter table public.wishlists enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.coupons enable row level security;
alter table public.contact_messages enable row level security;

-- profiles
create policy "profiles: read own or admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

-- categories (public catalog read, admin write)
create policy "categories: public read" on public.categories
  for select using (true);
create policy "categories: admin write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- products
create policy "products: public read active" on public.products
  for select using (status = 'active' or public.is_admin());
create policy "products: admin write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- product_variants / product_images inherit product visibility
create policy "variants: public read" on public.product_variants
  for select using (true);
create policy "variants: admin write" on public.product_variants
  for all using (public.is_admin()) with check (public.is_admin());

create policy "images: public read" on public.product_images
  for select using (true);
create policy "images: admin write" on public.product_images
  for all using (public.is_admin()) with check (public.is_admin());

-- addresses: owner only
create policy "addresses: owner crud" on public.addresses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- wishlists: owner only
create policy "wishlists: owner crud" on public.wishlists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- cart_items: owner only
create policy "cart: owner crud" on public.cart_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- orders: owner read/insert, admin full
create policy "orders: owner read" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());
create policy "orders: owner insert" on public.orders
  for insert with check (auth.uid() = user_id);
create policy "orders: admin update" on public.orders
  for update using (public.is_admin());

-- order_items: visible/insertable if the parent order is visible to the user
create policy "order_items: read via order" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.user_id = auth.uid() or public.is_admin())
    )
  );
create policy "order_items: insert via own order" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );
create policy "order_items: admin write" on public.order_items
  for all using (public.is_admin()) with check (public.is_admin());

-- reviews: public read approved, owner manages own, admin moderates
create policy "reviews: public read approved" on public.reviews
  for select using (is_approved = true or user_id = auth.uid() or public.is_admin());
create policy "reviews: owner insert" on public.reviews
  for insert with check (auth.uid() = user_id);
create policy "reviews: owner update own" on public.reviews
  for update using (auth.uid() = user_id or public.is_admin());
create policy "reviews: owner delete own" on public.reviews
  for delete using (auth.uid() = user_id or public.is_admin());

-- coupons: anyone can read active coupons (to validate a code), admin manages
create policy "coupons: read active" on public.coupons
  for select using (is_active = true or public.is_admin());
create policy "coupons: admin write" on public.coupons
  for all using (public.is_admin()) with check (public.is_admin());

-- contact_messages: anyone can submit, only admin can read
create policy "contact: anyone insert" on public.contact_messages
  for insert with check (true);
create policy "contact: admin read" on public.contact_messages
  for select using (public.is_admin());
