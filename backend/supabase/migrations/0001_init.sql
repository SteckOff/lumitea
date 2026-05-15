-- Lumi Tea — initial schema
-- Run after creating a fresh Supabase project.
-- Tables: profiles, addresses, products, gift_sets, orders, promotions, subscribers, fcm_tokens.

set check_function_bodies = off;

----------------------------------------------------------------------
-- Enums
----------------------------------------------------------------------

create type order_status as enum (
  'pending',
  'paid',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

create type product_category as enum (
  'oolong',
  'black',
  'green',
  'white',
  'wellness'
);

----------------------------------------------------------------------
-- profiles (extends auth.users)
----------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  phone text,
  locale text default 'en' check (locale in ('en', 'ko', 'ru')),
  is_admin boolean not null default false,
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_is_admin_idx on public.profiles (is_admin) where is_admin = true;

-- auto-create profile row on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

----------------------------------------------------------------------
-- addresses (Korean format)
----------------------------------------------------------------------

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  recipient_name text not null,
  phone text not null,
  postal_code text not null,
  address1 text not null,
  address2 text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index addresses_user_id_idx on public.addresses (user_id);

-- only one default address per user
create unique index addresses_one_default_per_user
  on public.addresses (user_id) where is_default = true;

----------------------------------------------------------------------
-- products
----------------------------------------------------------------------

create table public.products (
  id bigserial primary key,
  slug text unique not null,
  name text not null,
  name_ko text not null,
  name_ru text not null,
  category product_category not null,
  description text not null,
  description_ko text not null,
  description_ru text not null,
  tags text[] not null default '{}',
  tags_ko text[] not null default '{}',
  tags_ru text[] not null default '{}',
  price integer not null check (price >= 0),         -- KRW (whole won)
  original_price integer check (original_price >= 0),-- for promo strikethrough
  image_url text not null,
  weight text not null default '100g',
  stock integer not null default 0 check (stock >= 0),
  bestseller boolean not null default false,
  is_new boolean not null default false,
  out_of_stock boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_idx on public.products (category) where is_active = true;
create index products_bestseller_idx on public.products (bestseller) where is_active = true and bestseller = true;
create index products_new_idx on public.products (is_new) where is_active = true and is_new = true;

----------------------------------------------------------------------
-- gift_sets
----------------------------------------------------------------------

create table public.gift_sets (
  id bigserial primary key,
  slug text unique not null,
  name text not null,
  name_ko text not null,
  name_ru text not null,
  description text not null,
  description_ko text not null,
  description_ru text not null,
  price integer not null check (price >= 0),
  original_price integer check (original_price >= 0),
  includes jsonb not null default '[]'::jsonb,    -- array of strings
  image_url text not null,
  bestseller boolean not null default false,
  is_new boolean not null default false,
  stock integer not null default 0 check (stock >= 0),
  out_of_stock boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

----------------------------------------------------------------------
-- promotions (acts / sales)
----------------------------------------------------------------------

create table public.promotions (
  id bigserial primary key,
  title text not null,
  title_ko text not null,
  title_ru text not null,
  body text not null,
  body_ko text not null,
  body_ru text not null,
  image_url text,
  discount_pct integer check (discount_pct between 0 and 100),
  product_ids bigint[] default '{}',     -- optional scope
  promo_code text,                       -- optional manual code
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  pushed_at timestamptz,                 -- when admin pressed "send push"
  push_sent_count integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index promotions_active_idx on public.promotions (is_active, ends_at) where is_active = true;

----------------------------------------------------------------------
-- orders
----------------------------------------------------------------------

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no text unique not null,                       -- human-readable: LT-20260515-0001
  user_id uuid references public.profiles(id) on delete set null,
  user_email text not null,                            -- snapshot for guest/deletion
  user_name text,
  items jsonb not null,                                -- snapshot: [{id, type, name, price, qty, image_url}]
  address_snapshot jsonb not null,                     -- snapshot of address at checkout
  subtotal integer not null check (subtotal >= 0),
  shipping integer not null default 0 check (shipping >= 0),
  discount integer not null default 0 check (discount >= 0),
  total integer not null check (total >= 0),
  currency text not null default 'KRW',
  status order_status not null default 'pending',
  payment_provider text,                               -- 'stripe' | 'toss' | 'kakao'
  payment_intent_id text,                              -- Stripe PI id, etc.
  promo_code text,
  printed boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_id_idx on public.orders (user_id, created_at desc);
create index orders_status_idx on public.orders (status, created_at desc);
create index orders_order_no_idx on public.orders (order_no);

-- order_no generator: LT-YYYYMMDD-XXXX
create or replace function public.generate_order_no()
returns text
language plpgsql
as $$
declare
  today_prefix text;
  next_seq int;
begin
  today_prefix := 'LT-' || to_char(now() at time zone 'Asia/Seoul', 'YYYYMMDD') || '-';
  select coalesce(max(substring(order_no from length(today_prefix) + 1)::int), 0) + 1
    into next_seq
    from public.orders
   where order_no like today_prefix || '%';
  return today_prefix || lpad(next_seq::text, 4, '0');
end;
$$;

create or replace function public.set_order_no()
returns trigger
language plpgsql
as $$
begin
  if new.order_no is null or new.order_no = '' then
    new.order_no := public.generate_order_no();
  end if;
  return new;
end;
$$;

create trigger orders_set_order_no
  before insert on public.orders
  for each row execute function public.set_order_no();

----------------------------------------------------------------------
-- order_items (for reporting; orders.items keeps the snapshot)
----------------------------------------------------------------------

create table public.order_items (
  id bigserial primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  item_type text not null check (item_type in ('product', 'gift_set')),
  product_id bigint,
  gift_set_id bigint,
  name_snapshot text not null,
  price_at_purchase integer not null check (price_at_purchase >= 0),
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);

----------------------------------------------------------------------
-- fcm_tokens (push subscriptions)
----------------------------------------------------------------------

create table public.fcm_tokens (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  token text unique not null,
  platform text not null check (platform in ('android', 'ios', 'web')),
  locale text default 'en' check (locale in ('en', 'ko', 'ru')),
  last_active_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index fcm_tokens_user_id_idx on public.fcm_tokens (user_id);

----------------------------------------------------------------------
-- subscribers (newsletter)
----------------------------------------------------------------------

create table public.subscribers (
  id bigserial primary key,
  email text unique not null,
  locale text default 'en' check (locale in ('en', 'ko', 'ru')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

----------------------------------------------------------------------
-- updated_at triggers
----------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_profiles    before update on public.profiles    for each row execute function public.touch_updated_at();
create trigger touch_products    before update on public.products    for each row execute function public.touch_updated_at();
create trigger touch_gift_sets   before update on public.gift_sets   for each row execute function public.touch_updated_at();
create trigger touch_promotions  before update on public.promotions  for each row execute function public.touch_updated_at();
create trigger touch_orders      before update on public.orders      for each row execute function public.touch_updated_at();
