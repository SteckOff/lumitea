// stripe-webhook
// Stripe → Supabase: marks orders paid/refunded, decrements stock, sends confirmation email.
// Verifies signature using STRIPE_WEBHOOK_SECRET.
//
// IMPORTANT: when deploying, set "verify_jwt = false" for this function (no auth header needed).
// Env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
//      SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM.

import { createClient } from 'jsr:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17';
import { sendMail } from '../_shared/mailer.ts';

const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')!;
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const stripe = new Stripe(stripeKey, { apiVersion: '2024-12-18.acacia' as any });
const admin = createClient(supabaseUrl, serviceKey);

async function decrementStock(orderId: string) {
  const { data: items } = await admin
    .from('order_items')
    .select('item_type, product_id, gift_set_id, quantity')
    .eq('order_id', orderId);

  if (!items) return;

  for (const it of items) {
    if (it.item_type === 'product' && it.product_id) {
      await admin.rpc('decrement_product_stock', { p_id: it.product_id, qty: it.quantity }).catch(async () => {
        // fallback: read-modify-write
        const { data: p } = await admin.from('products').select('stock').eq('id', it.product_id).single();
        if (p) {
          const newStock = Math.max(0, (p.stock ?? 0) - it.quantity);
          await admin.from('products').update({
            stock: newStock,
            out_of_stock: newStock === 0,
          }).eq('id', it.product_id);
        }
      });
    } else if (it.item_type === 'gift_set' && it.gift_set_id) {
      const { data: g } = await admin.from('gift_sets').select('stock').eq('id', it.gift_set_id).single();
      if (g) {
        const newStock = Math.max(0, (g.stock ?? 0) - it.quantity);
        await admin.from('gift_sets').update({
          stock: newStock,
          out_of_stock: newStock === 0,
        }).eq('id', it.gift_set_id);
      }
    }
  }
}

async function sendConfirmationEmail(orderId: string) {
  const { data: order } = await admin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();
  if (!order) return;

  const itemsHtml = (order.items as any[])
    .map(
      (i) =>
        `<tr>
           <td style="padding:8px 0">${i.name_snapshot}</td>
           <td style="padding:8px 0;text-align:right">×${i.quantity}</td>
           <td style="padding:8px 0;text-align:right">₩${(i.price_at_purchase * i.quantity).toLocaleString('ko-KR')}</td>
         </tr>`,
    )
    .join('');

  const html = `<!doctype html>
<html><body style="font-family:system-ui,-apple-system,sans-serif;background:#fafafa;padding:24px;color:#222">
  <div style="max-width:560px;margin:auto;background:#fff;border-radius:14px;padding:28px;box-shadow:0 1px 4px rgba(0,0,0,.06)">
    <h1 style="color:#E91E63;font-size:22px;margin:0 0 12px">Lumi Tea</h1>
    <p style="margin:0 0 16px">Thank you for your order <strong>${order.order_no}</strong>!</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <thead><tr style="border-bottom:1px solid #eee"><th align="left">Item</th><th align="right">Qty</th><th align="right">Total</th></tr></thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <hr style="border:none;border-top:1px solid #eee;margin:16px 0">
    <p style="margin:0;text-align:right;font-size:14px">
      Subtotal: ₩${order.subtotal.toLocaleString('ko-KR')}<br>
      Shipping: ₩${order.shipping.toLocaleString('ko-KR')}<br>
      <strong style="font-size:16px;color:#E91E63">Total: ₩${order.total.toLocaleString('ko-KR')}</strong>
    </p>
    <p style="margin:24px 0 0;color:#666;font-size:13px">We'll email you again once your order ships.</p>
  </div>
</body></html>`;

  const text = `Lumi Tea — Order ${order.order_no} confirmed. Total: ₩${order.total.toLocaleString('ko-KR')}.`;

  await sendMail({
    to: order.user_email,
    subject: `Lumi Tea — Order ${order.order_no} confirmed ✓`,
    text,
    html,
  });
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method', { status: 405 });

  const sig = req.headers.get('stripe-signature');
  if (!sig) return new Response('no signature', { status: 400 });

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(raw, sig, webhookSecret);
  } catch (e) {
    console.error('signature_check_failed', e);
    return new Response('bad signature', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const orderId = pi.metadata?.order_id;
        if (!orderId) break;
        const { error } = await admin
          .from('orders')
          .update({ status: 'paid' })
          .eq('id', orderId)
          .eq('status', 'pending');
        if (!error) {
          await decrementStock(orderId);
          await sendConfirmationEmail(orderId);
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const orderId = pi.metadata?.order_id;
        if (orderId) {
          await admin.from('orders').update({
            status: 'cancelled',
            notes: pi.last_payment_error?.message ?? 'payment_failed',
          }).eq('id', orderId);
        }
        break;
      }
      case 'charge.refunded': {
        const ch = event.data.object as Stripe.Charge;
        const piId = typeof ch.payment_intent === 'string' ? ch.payment_intent : ch.payment_intent?.id;
        if (piId) {
          await admin.from('orders').update({ status: 'refunded' }).eq('payment_intent_id', piId);
        }
        break;
      }
    }
  } catch (e) {
    console.error('webhook_handler_failed', e);
    return new Response('handler error', { status: 500 });
  }

  return new Response('ok', { status: 200 });
});
