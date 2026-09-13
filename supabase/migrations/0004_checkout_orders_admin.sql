-- BELTYX migration 0004: multi-step checkout, order status/timeline, payment
-- gateway support, inventory decrement, coupon restrictions/usage tracking,
-- product specifications, and review images.
-- Purely additive/alters — safe to run after 0001-0003.

-- ---------------------------------------------------------------------------
-- orders: full status lifecycle + shipping method
-- ---------------------------------------------------------------------------
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check check (
  status in ('pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned')
);

-- payment_method is validated in the app against the payment-provider registry
-- (see src/lib/payments) rather than a fixed DB enum, so new gateways can be
-- added without a migration.
alter table public.orders drop constraint if exists orders_payment_method_check;

alter table public.orders add column if not exists shipping_method text not null default 'standard'
  check (shipping_method in ('standard', 'express'));
alter table public.orders add column if not exists estimated_delivery date;

-- ---------------------------------------------------------------------------
-- order status history (tracking timeline)
-- ---------------------------------------------------------------------------
create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  status text not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists order_status_history_order_id_idx on public.order_status_history (order_id);

alter table public.order_status_history enable row level security;

create policy "order_status_history: read via order" on public.order_status_history
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_status_history.order_id
        and (o.user_id = auth.uid() or public.is_admin())
    )
  );
create policy "order_status_history: admin write" on public.order_status_history
  for all using (public.is_admin()) with check (public.is_admin());

create function public.log_order_status_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.order_status_history (order_id, status) values (new.id, new.status);
  elsif (tg_op = 'UPDATE' and new.status is distinct from old.status) then
    insert into public.order_status_history (order_id, status) values (new.id, new.status);
  end if;
  return new;
end;
$$;

drop trigger if exists on_order_status_logged on public.orders;
create trigger on_order_status_logged
  after insert or update of status on public.orders
  for each row execute procedure public.log_order_status_change();

-- ---------------------------------------------------------------------------
-- inventory: low-stock threshold, atomic decrement + overselling guard
-- ---------------------------------------------------------------------------
alter table public.products add column if not exists low_stock_threshold int not null default 5;
alter table public.products add column if not exists specifications jsonb not null default '{}'::jsonb;

create function public.reserve_stock_and_track_sales()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  available int;
begin
  if new.variant_id is not null then
    select stock into available from public.product_variants where id = new.variant_id for update;
    if available is null or available < new.quantity then
      raise exception 'Insufficient stock for the selected variant' using errcode = 'P0001';
    end if;
    update public.product_variants set stock = stock - new.quantity where id = new.variant_id;
  end if;
  if new.product_id is not null then
    select stock into available from public.products where id = new.product_id for update;
    if available is null or available < new.quantity then
      raise exception 'Insufficient stock for this product' using errcode = 'P0001';
    end if;
    update public.products set stock = stock - new.quantity, sales_count = sales_count + new.quantity
      where id = new.product_id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_order_item_created on public.order_items;
create trigger on_order_item_created
  before insert on public.order_items
  for each row execute procedure public.reserve_stock_and_track_sales();

-- ---------------------------------------------------------------------------
-- coupons: expiry/usage were already columns; add product/category restriction
-- and auto-increment used_count when an order applies a coupon
-- ---------------------------------------------------------------------------
alter table public.coupons add column if not exists category_id uuid references public.categories (id) on delete set null;
alter table public.coupons add column if not exists product_id uuid references public.products (id) on delete set null;

create function public.increment_coupon_usage()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.coupon_code is not null then
    update public.coupons set used_count = used_count + 1 where code ilike new.coupon_code;
  end if;
  return new;
end;
$$;

drop trigger if exists on_order_coupon_applied on public.orders;
create trigger on_order_coupon_applied
  after insert on public.orders
  for each row execute procedure public.increment_coupon_usage();

-- ---------------------------------------------------------------------------
-- reviews: optional photo
-- ---------------------------------------------------------------------------
alter table public.reviews add column if not exists image_url text;
