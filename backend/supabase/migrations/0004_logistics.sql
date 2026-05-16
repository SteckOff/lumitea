-- Lumi Tea — logistics: tracking + product photos + status audit
-- Adds shipment tracking on orders and a product_photos table for gallery support.

----------------------------------------------------------------------
-- orders: tracking + carrier columns
----------------------------------------------------------------------

alter table public.orders
  add column if not exists tracking_code text,
  add column if not exists carrier text;

----------------------------------------------------------------------
-- order_status_history — audit trail of status changes
----------------------------------------------------------------------

create table if not exists public.order_status_history (
  id bigserial primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status order_status,
  to_status order_status not null,
  note text,
  changed_by uuid references public.profiles(id) on delete set null,
  changed_at timestamptz not null default now()
);

create index if not exists order_status_history_order_idx
  on public.order_status_history (order_id, changed_at desc);

-- Trigger: log every status change automatically.
create or replace function public.log_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'UPDATE' and new.status is distinct from old.status) then
    insert into public.order_status_history (order_id, from_status, to_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists trg_log_order_status_change on public.orders;
create trigger trg_log_order_status_change
  after update on public.orders
  for each row execute function public.log_order_status_change();

----------------------------------------------------------------------
-- product_photos — gallery (extra images beyond main image_url)
----------------------------------------------------------------------

create table if not exists public.product_photos (
  id bigserial primary key,
  product_id bigint references public.products(id) on delete cascade,
  gift_set_id bigint references public.gift_sets(id) on delete cascade,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint product_photos_one_owner_chk
    check ((product_id is not null) <> (gift_set_id is not null))
);

create index if not exists product_photos_product_idx
  on public.product_photos (product_id, sort_order);
create index if not exists product_photos_gift_set_idx
  on public.product_photos (gift_set_id, sort_order);

----------------------------------------------------------------------
-- RLS for new tables
----------------------------------------------------------------------

alter table public.order_status_history enable row level security;
alter table public.product_photos enable row level security;

-- order_status_history: user sees their own; admin sees all.
drop policy if exists "history_self_read" on public.order_status_history;
create policy "history_self_read" on public.order_status_history
  for select using (
    exists (select 1 from public.orders o
            where o.id = order_id and o.user_id = auth.uid())
  );

drop policy if exists "history_admin_all" on public.order_status_history;
create policy "history_admin_all" on public.order_status_history
  for all using (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.is_admin = true)
  );

-- product_photos: public read; admin write.
drop policy if exists "photos_public_read" on public.product_photos;
create policy "photos_public_read" on public.product_photos
  for select using (true);

drop policy if exists "photos_admin_write" on public.product_photos;
create policy "photos_admin_write" on public.product_photos
  for all using (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.is_admin = true)
  );
