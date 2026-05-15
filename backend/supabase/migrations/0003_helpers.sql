-- Helper RPCs used by Edge Functions.

create or replace function public.decrement_product_stock(p_id bigint, qty int)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.products
     set stock = greatest(0, stock - qty),
         out_of_stock = (stock - qty) <= 0
   where id = p_id;
end;
$$;

create or replace function public.decrement_gift_set_stock(p_id bigint, qty int)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.gift_sets
     set stock = greatest(0, stock - qty),
         out_of_stock = (stock - qty) <= 0
   where id = p_id;
end;
$$;

-- only callable by service_role / authenticated admin via direct SQL; not exposed to anon
revoke all on function public.decrement_product_stock(bigint, int) from public, anon;
revoke all on function public.decrement_gift_set_stock(bigint, int) from public, anon;
