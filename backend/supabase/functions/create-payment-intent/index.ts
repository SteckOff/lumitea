// create-payment-intent
// Verifies cart against DB, creates a `pending` order, then creates a Stripe PaymentIntent.
// Returns { client_secret, order_no }.
//
// Auth: requires Supabase user JWT (Authorization: Bearer ...). Guest checkout NOT supported here.
// Env: STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from 'jsr:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17';
import { handlePreflight, json } from '../_shared/cors.ts';

interface CartLine {
  item_type: 'product' | 'gift_set';
  item_id: number;
  quantity: number;
}

interface RequestBody {
  items: CartLine[];
  address_id?: string;
  address?: {
    recipient_name: string;
    phone: string;
    postal_code: string;
    address1: string;
    address2?: string;
  };
  promo_code?: string;
  locale?: 'en' | 'ko' | 'ru';
}

const SHIPPING_FLAT_KRW = 3000;
const FREE_SHIPPING_THRESHOLD_KRW = 50000;

Deno.serve(async (req) => {
  const pre = handlePreflight(req);
  if (pre) return pre;

  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const auth = req.headers.get('Authorization');
  if (!auth) return json({ error: 'unauthorized' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')!;
  if (!stripeKey) return json({ error: 'stripe_not_configured' }, 500);

  // Validate user via their JWT
  const userClient = createClient(supabaseUrl, serviceKey, {
    global: { headers: { Authorization: auth } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) return json({ error: 'unauthorized' }, 401);
  const userId = userData.user.id;

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return json({ error: 'empty_cart' }, 400);
  }

  // Privileged client for trusted reads/writes (bypasses RLS for products & orders insert)
  const admin = createClient(supabaseUrl, serviceKey);

  // 1. Fetch authoritative prices/stock from DB.
  const productIds = body.items.filter((i) => i.item_type === 'product').map((i) => i.item_id);
  const giftSetIds = body.items.filter((i) => i.item_type === 'gift_set').map((i) => i.item_id);

  const [{ data: products }, { data: giftSets }] = await Promise.all([
    productIds.length
      ? admin.from('products').select('id, name, price, stock, image_url').in('id', productIds)
      : Promise.resolve({ data: [] as any[] }),
    giftSetIds.length
      ? admin.from('gift_sets').select('id, name, price, stock, image_url').in('id', giftSetIds)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const byKey = new Map<string, { name: string; price: number; stock: number; image: string }>();
  for (const p of products ?? []) byKey.set(`product:${p.id}`, {
    name: p.name, price: p.price, stock: p.stock, image: p.image_url,
  });
  for (const g of giftSets ?? []) byKey.set(`gift_set:${g.id}`, {
    name: g.name, price: g.price, stock: g.stock, image: g.image_url,
  });

  // 2. Compute totals server-side. Refuse if out of stock or unknown SKU.
  let subtotal = 0;
  const snapshot: any[] = [];
  for (const line of body.items) {
    const key = `${line.item_type}:${line.item_id}`;
    const found = byKey.get(key);
    if (!found) return json({ error: 'unknown_item', item: key }, 400);
    if (line.quantity <= 0) return json({ error: 'bad_quantity', item: key }, 400);
    if (found.stock < line.quantity) return json({ error: 'out_of_stock', item: key }, 409);
    subtotal += found.price * line.quantity;
    snapshot.push({
      item_type: line.item_type,
      item_id: line.item_id,
      name_snapshot: found.name,
      price_at_purchase: found.price,
      quantity: line.quantity,
      image_url: found.image,
    });
  }

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD_KRW ? 0 : SHIPPING_FLAT_KRW;
  const total = subtotal + shipping;

  // 3. Resolve shipping address (saved or new snapshot).
  let addressSnapshot: any;
  if (body.address_id) {
    const { data, error } = await admin
      .from('addresses')
      .select('*')
      .eq('id', body.address_id)
      .eq('user_id', userId)
      .single();
    if (error || !data) return json({ error: 'address_not_found' }, 404);
    addressSnapshot = data;
  } else if (body.address) {
    addressSnapshot = body.address;
  } else {
    return json({ error: 'address_required' }, 400);
  }

  // 4. Insert pending order.
  const { data: order, error: orderErr } = await admin
    .from('orders')
    .insert({
      user_id: userId,
      user_email: userData.user.email!,
      user_name: userData.user.user_metadata?.name ?? null,
      items: snapshot,
      address_snapshot: addressSnapshot,
      subtotal,
      shipping,
      total,
      currency: 'KRW',
      status: 'pending',
      payment_provider: 'stripe',
      promo_code: body.promo_code ?? null,
    })
    .select('id, order_no')
    .single();

  if (orderErr || !order) {
    console.error('order_insert_failed', orderErr);
    return json({ error: 'order_create_failed' }, 500);
  }

  // 5. Also write to order_items (for reporting).
  await admin.from('order_items').insert(
    snapshot.map((s) => ({
      order_id: order.id,
      item_type: s.item_type,
      product_id: s.item_type === 'product' ? s.item_id : null,
      gift_set_id: s.item_type === 'gift_set' ? s.item_id : null,
      name_snapshot: s.name_snapshot,
      price_at_purchase: s.price_at_purchase,
      quantity: s.quantity,
    })),
  );

  // 6. Stripe PaymentIntent.
  const stripe = new Stripe(stripeKey, { apiVersion: '2024-12-18.acacia' as any });
  let intent;
  try {
    intent = await stripe.paymentIntents.create({
      amount: total, // KRW has no minor units; Stripe expects integer amount
      currency: 'krw',
      automatic_payment_methods: { enabled: true },
      metadata: {
        order_id: order.id,
        order_no: order.order_no,
        user_id: userId,
      },
    });
  } catch (e) {
    console.error('stripe_pi_failed', e);
    await admin.from('orders').update({ status: 'cancelled', notes: 'stripe_pi_failed' }).eq('id', order.id);
    return json({ error: 'stripe_failed' }, 502);
  }

  await admin.from('orders').update({ payment_intent_id: intent.id }).eq('id', order.id);

  return json({
    client_secret: intent.client_secret,
    order_id: order.id,
    order_no: order.order_no,
    total,
    currency: 'KRW',
  });
});
