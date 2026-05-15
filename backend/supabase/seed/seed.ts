/**
 * One-shot seed: loads products & gift sets from src/data/products.ts into Supabase.
 * Run with:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx backend/supabase/seed/seed.ts
 *
 * Uses the service_role key (bypasses RLS) — keep it server-side.
 */

import { createClient } from '@supabase/supabase-js';
import { products, giftSets } from '../../../src/data/products';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function seedProducts() {
  console.log(`Seeding ${products.length} products...`);
  const rows = products.map((p) => ({
    id: p.id,
    slug: slugify(p.name) + '-' + p.id,
    name: p.name,
    name_ko: p.nameKo,
    name_ru: p.nameRu,
    category: p.category,
    description: p.description,
    description_ko: p.descriptionKo,
    description_ru: p.descriptionRu,
    tags: p.tags,
    tags_ko: p.tagsKo,
    tags_ru: p.tagsRu,
    price: p.price,
    original_price: p.originalPrice ?? null,
    image_url: p.image,
    weight: p.weight,
    stock: p.stock,
    bestseller: !!p.bestseller,
    is_new: !!p.new,
    out_of_stock: !!p.outOfStock,
    is_active: true,
  }));

  const { error } = await supabase
    .from('products')
    .upsert(rows, { onConflict: 'id' });

  if (error) throw error;
  console.log(`✓ products: ${rows.length}`);

  // reset id sequence so future inserts don't collide
  const maxId = Math.max(...rows.map((r) => r.id));
  await supabase.rpc('exec', {
    sql: `select setval(pg_get_serial_sequence('products','id'), ${maxId});`,
  }).catch(() => {
    /* exec rpc may not exist — manual seq reset is optional */
  });
}

async function seedGiftSets() {
  console.log(`Seeding ${giftSets.length} gift sets...`);
  const rows = giftSets.map((g: any) => ({
    id: g.id,
    slug: slugify(g.name) + '-' + g.id,
    name: g.name,
    name_ko: g.nameKo,
    name_ru: g.nameRu,
    description: g.description,
    description_ko: g.descriptionKo,
    description_ru: g.descriptionRu,
    price: g.price,
    original_price: g.originalPrice ?? null,
    includes: g.includes ?? [],
    image_url: g.image,
    bestseller: !!g.bestseller,
    is_new: !!g.new,
    stock: g.stock ?? 0,
    out_of_stock: !!g.outOfStock,
    is_active: true,
  }));

  const { error } = await supabase
    .from('gift_sets')
    .upsert(rows, { onConflict: 'id' });

  if (error) throw error;
  console.log(`✓ gift_sets: ${rows.length}`);
}

(async () => {
  await seedProducts();
  await seedGiftSets();
  console.log('Done.');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
