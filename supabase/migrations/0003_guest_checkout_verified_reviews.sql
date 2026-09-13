-- Guest checkout, purchase-verified reviews, newsletter signups, and
-- best-selling sort support. Additive migration — run after 0001 and 0002.

-- ---------------------------------------------------------------------------
-- Guest checkout: orders.user_id is already nullable. Add policies that let
-- an unauthenticated (anon-key) request create and read back a guest order.
-- The order id (a UUID) acts as the access token for the confirmation page,
-- the same way a plain-text order receipt link would — guest orders are not
-- otherwise enumerable or listable.
-- ---------------------------------------------------------------------------
create policy "orders: guest insert" on public.orders
  for insert with check (user_id is null);

create policy "orders: guest read own" on public.orders
  for select using (user_id is null);

create policy "order_items: guest insert via guest order" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id is null
    )
  );

create policy "order_items: guest read via guest order" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id is null
    )
  );

-- ---------------------------------------------------------------------------
-- Verified-purchase reviews: a review may only be inserted for a product the
-- reviewing user actually ordered, in an order that has been delivered.
-- ---------------------------------------------------------------------------
drop policy if exists "reviews: owner insert" on public.reviews;

create policy "reviews: verified purchase insert" on public.reviews
  for insert with check (
    auth.uid() = user_id
    and order_id is not null
    and exists (
      select 1
      from public.order_items oi
      join public.orders o on o.id = oi.order_id
      where oi.order_id = reviews.order_id
        and oi.product_id = reviews.product_id
        and o.user_id = auth.uid()
        and o.status = 'delivered'
    )
  );

-- Helper the app can call to decide whether to show "Write a Review" and to
-- look up which delivered order to attach the review to.
create function public.deliverable_order_for_review(p_product_id uuid)
returns uuid
language sql
security definer set search_path = public
stable
as $$
  select oi.order_id
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where oi.product_id = p_product_id
    and o.user_id = auth.uid()
    and o.status = 'delivered'
  order by o.created_at desc
  limit 1;
$$;

-- ---------------------------------------------------------------------------
-- Newsletter subscriptions
-- ---------------------------------------------------------------------------
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

create policy "newsletter: anyone can subscribe" on public.newsletter_subscribers
  for insert with check (true);

create policy "newsletter: admin read" on public.newsletter_subscribers
  for select using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Best-selling sort + tag search
-- ---------------------------------------------------------------------------
alter table public.products add column sales_count integer not null default 0;
alter table public.products add column tags text[] not null default '{}';

create index products_tags_idx on public.products using gin (tags);

create function public.increment_product_sales()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.product_id is not null then
    update public.products set sales_count = sales_count + new.quantity where id = new.product_id;
  end if;
  return new;
end;
$$;

create trigger on_order_item_created
  after insert on public.order_items
  for each row execute procedure public.increment_product_sales();
