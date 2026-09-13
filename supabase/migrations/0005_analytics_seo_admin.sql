-- BELTYX: product view tracking (for admin "Most Viewed Products" analytics).

alter table public.products add column if not exists view_count int not null default 0;

-- Anonymous/authenticated shoppers may increment a product's view counter but
-- cannot otherwise write to products, so this goes through a SECURITY DEFINER
-- RPC rather than a broad RLS update policy.
create or replace function public.increment_product_view(p_product_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.products set view_count = view_count + 1 where id = p_product_id;
end;
$$;

grant execute on function public.increment_product_view(uuid) to anon, authenticated;
