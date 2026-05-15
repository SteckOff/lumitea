-- Lumi Tea — Row Level Security
-- Run after 0001_init.sql. Locks down all tables so the frontend can only see what it should.

----------------------------------------------------------------------
-- Helper: is current user an admin?
----------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

----------------------------------------------------------------------
-- Enable RLS on everything
----------------------------------------------------------------------
alter table public.profiles      enable row level security;
alter table public.addresses     enable row level security;
alter table public.products      enable row level security;
alter table public.gift_sets     enable row level security;
alter table public.promotions    enable row level security;
alter table public.orders        enable row level security;
alter table public.order_items   enable row level security;
alter table public.fcm_tokens    enable row level security;
alter table public.subscribers   enable row level security;

----------------------------------------------------------------------
-- profiles
----------------------------------------------------------------------
create policy "profiles: read own"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles: update own"
  on public.profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    -- prevent self-promotion to admin: ignore is_admin in update payload
    and is_admin = (select is_admin from public.profiles where id = auth.uid())
  );

create policy "profiles: admin update any"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- INSERT is done via trigger handle_new_user; no client policy needed.

----------------------------------------------------------------------
-- addresses
----------------------------------------------------------------------
create policy "addresses: owner all"
  on public.addresses for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "addresses: admin read"
  on public.addresses for select
  using (public.is_admin());

----------------------------------------------------------------------
-- products (public catalog)
----------------------------------------------------------------------
create policy "products: public read active"
  on public.products for select
  using (is_active = true or public.is_admin());

create policy "products: admin write"
  on public.products for insert
  with check (public.is_admin());

create policy "products: admin update"
  on public.products for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "products: admin delete"
  on public.products for delete
  using (public.is_admin());

----------------------------------------------------------------------
-- gift_sets
----------------------------------------------------------------------
create policy "gift_sets: public read active"
  on public.gift_sets for select
  using (is_active = true or public.is_admin());

create policy "gift_sets: admin write"
  on public.gift_sets for insert
  with check (public.is_admin());

create policy "gift_sets: admin update"
  on public.gift_sets for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "gift_sets: admin delete"
  on public.gift_sets for delete
  using (public.is_admin());

----------------------------------------------------------------------
-- promotions
----------------------------------------------------------------------
create policy "promotions: public read live"
  on public.promotions for select
  using (
    public.is_admin()
    or (
      is_active = true
      and starts_at <= now()
      and (ends_at is null or ends_at > now())
    )
  );

create policy "promotions: admin write"
  on public.promotions for insert
  with check (public.is_admin());

create policy "promotions: admin update"
  on public.promotions for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "promotions: admin delete"
  on public.promotions for delete
  using (public.is_admin());

----------------------------------------------------------------------
-- orders
----------------------------------------------------------------------
-- IMPORTANT: clients cannot INSERT or UPDATE orders directly.
-- Only the Edge Function (service_role key) writes orders & marks them paid.
-- This prevents price-spoofing from the client.
create policy "orders: owner read"
  on public.orders for select
  using (user_id = auth.uid() or public.is_admin());

create policy "orders: admin update"
  on public.orders for update
  using (public.is_admin())
  with check (public.is_admin());

----------------------------------------------------------------------
-- order_items
----------------------------------------------------------------------
create policy "order_items: owner read"
  on public.order_items for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.orders o
       where o.id = order_items.order_id
         and o.user_id = auth.uid()
    )
  );

----------------------------------------------------------------------
-- fcm_tokens
----------------------------------------------------------------------
create policy "fcm_tokens: owner upsert"
  on public.fcm_tokens for insert
  with check (user_id = auth.uid() or user_id is null);

create policy "fcm_tokens: owner read"
  on public.fcm_tokens for select
  using (user_id = auth.uid() or public.is_admin());

create policy "fcm_tokens: owner update"
  on public.fcm_tokens for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "fcm_tokens: owner delete"
  on public.fcm_tokens for delete
  using (user_id = auth.uid() or public.is_admin());

----------------------------------------------------------------------
-- subscribers (newsletter)
----------------------------------------------------------------------
create policy "subscribers: public insert"
  on public.subscribers for insert
  with check (true);

create policy "subscribers: admin read"
  on public.subscribers for select
  using (public.is_admin());

create policy "subscribers: admin write"
  on public.subscribers for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "subscribers: admin delete"
  on public.subscribers for delete
  using (public.is_admin());
