// Hand-written types matching backend/supabase/migrations/0001_init.sql.
// Regenerate with:  supabase gen types typescript --project-id <ref> > src/lib/database.types.ts

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type ProductCategory = 'oolong' | 'black' | 'green' | 'white' | 'wellness';
export type Locale = 'en' | 'ko' | 'ru';

export interface ProductRow {
  id: number;
  slug: string;
  name: string;
  name_ko: string;
  name_ru: string;
  category: ProductCategory;
  description: string;
  description_ko: string;
  description_ru: string;
  tags: string[];
  tags_ko: string[];
  tags_ru: string[];
  price: number;
  original_price: number | null;
  image_url: string;
  weight: string;
  stock: number;
  bestseller: boolean;
  is_new: boolean;
  out_of_stock: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GiftSetRow {
  id: number;
  slug: string;
  name: string;
  name_ko: string;
  name_ru: string;
  description: string;
  description_ko: string;
  description_ru: string;
  price: number;
  original_price: number | null;
  includes: string[];
  image_url: string;
  bestseller: boolean;
  is_new: boolean;
  stock: number;
  out_of_stock: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileRow {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  locale: Locale;
  is_admin: boolean;
  marketing_opt_in: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddressRow {
  id: string;
  user_id: string;
  recipient_name: string;
  phone: string;
  postal_code: string;
  address1: string;
  address2: string | null;
  is_default: boolean;
  created_at: string;
}

export interface OrderItemSnapshot {
  item_type: 'product' | 'gift_set';
  item_id: number;
  name_snapshot: string;
  price_at_purchase: number;
  quantity: number;
  image_url: string;
}

export interface OrderRow {
  id: string;
  order_no: string;
  user_id: string | null;
  user_email: string;
  user_name: string | null;
  items: OrderItemSnapshot[];
  address_snapshot: {
    recipient_name: string;
    phone: string;
    postal_code: string;
    address1: string;
    address2?: string | null;
  };
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  payment_provider: string | null;
  payment_intent_id: string | null;
  promo_code: string | null;
  printed: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PromotionRow {
  id: number;
  title: string;
  title_ko: string;
  title_ru: string;
  body: string;
  body_ko: string;
  body_ru: string;
  image_url: string | null;
  discount_pct: number | null;
  product_ids: number[];
  promo_code: string | null;
  starts_at: string;
  ends_at: string | null;
  pushed_at: string | null;
  push_sent_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriberRow {
  id: number;
  email: string;
  locale: Locale;
  is_active: boolean;
  created_at: string;
}

export interface FcmTokenRow {
  id: number;
  user_id: string | null;
  token: string;
  platform: 'android' | 'ios' | 'web';
  locale: Locale;
  last_active_at: string;
  created_at: string;
}

// supabase-js v2 requires each table to have a Relationships array to satisfy
// the GenericTable constraint — without it, .update()/.insert() arg types collapse to never.
export interface Database {
  public: {
    Tables: {
      profiles: { Row: ProfileRow; Insert: Partial<ProfileRow> & { id: string; email: string }; Update: Partial<ProfileRow>; Relationships: [] };
      addresses: { Row: AddressRow; Insert: Omit<AddressRow, 'id' | 'created_at'>; Update: Partial<AddressRow>; Relationships: [] };
      products: { Row: ProductRow; Insert: Partial<ProductRow> & { name: string; price: number }; Update: Partial<ProductRow>; Relationships: [] };
      gift_sets: { Row: GiftSetRow; Insert: Partial<GiftSetRow> & { name: string; price: number }; Update: Partial<GiftSetRow>; Relationships: [] };
      orders: { Row: OrderRow; Insert: Partial<OrderRow>; Update: Partial<OrderRow>; Relationships: [] };
      promotions: { Row: PromotionRow; Insert: Partial<PromotionRow> & { title: string; body: string }; Update: Partial<PromotionRow>; Relationships: [] };
      subscribers: { Row: SubscriberRow; Insert: { email: string; locale?: Locale }; Update: Partial<SubscriberRow>; Relationships: [] };
      fcm_tokens: { Row: FcmTokenRow; Insert: Partial<FcmTokenRow> & { token: string; platform: 'android' | 'ios' | 'web' }; Update: Partial<FcmTokenRow>; Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: Record<string, unknown>;
    Enums: { order_status: OrderStatus; product_category: ProductCategory };
    CompositeTypes: Record<string, never>;
  };
}
