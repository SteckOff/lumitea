// send-order-status-update — email customer when order status changes.
// Admin calls this from the desktop/mobile admin app:
//   POST { order_id, status, tracking_code?, carrier?, note? }
//
// Auth: caller must be authenticated AND have profiles.is_admin = true.
// Writes the new status to orders (atomic), then emails the customer.

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { handlePreflight, json } from '../_shared/cors.ts';

interface Body {
  order_id: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  tracking_code?: string;
  carrier?: string;
  note?: string;
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://lumitea.kr';

const SUBJECT: Record<string, string> = {
  paid: 'Lumi Tea — заказ оплачен / 결제 완료',
  shipped: 'Lumi Tea — заказ отправлен / 발송되었습니다',
  delivered: 'Lumi Tea — заказ доставлен / 배송 완료',
  cancelled: 'Lumi Tea — заказ отменён / 주문 취소',
  refunded: 'Lumi Tea — возврат средств / 환불 처리',
};

function buildEmail(opts: {
  orderNo: string;
  status: string;
  tracking?: string;
  carrier?: string;
  note?: string;
  total: number;
}): { subject: string; text: string; html: string } {
  const subject = SUBJECT[opts.status] ?? `Lumi Tea — order ${opts.orderNo}`;
  const statusRu: Record<string, string> = {
    paid: 'Оплачен',
    shipped: 'Отправлен',
    delivered: 'Доставлен',
    cancelled: 'Отменён',
    refunded: 'Возврат',
  };
  const statusLine = statusRu[opts.status] ?? opts.status;

  const trackingBlock = opts.tracking
    ? `\nТрек-номер: ${opts.tracking}${opts.carrier ? ` (${opts.carrier})` : ''}\n`
    : '';
  const noteBlock = opts.note ? `\nПримечание: ${opts.note}\n` : '';

  const text =
    `Здравствуйте!\n\n` +
    `Статус вашего заказа ${opts.orderNo} обновлён: ${statusLine}.\n` +
    trackingBlock +
    noteBlock +
    `\nСумма: ${opts.total.toLocaleString('ko-KR')} ₩\n\n` +
    `Спасибо за покупку!\nLumi Tea — ${SITE_URL}\n`;

  const html = `<!doctype html>
<html><body style="font-family:system-ui,-apple-system,sans-serif;background:#fafafa;padding:24px;color:#222">
  <div style="max-width:520px;margin:auto;background:#fff;border-radius:12px;padding:28px;box-shadow:0 1px 4px rgba(0,0,0,.06)">
    <h1 style="color:#E91E63;font-size:22px;margin:0 0 12px">Lumi Tea</h1>
    <p style="font-size:15px;margin:0 0 16px">
      Статус вашего заказа <strong>${opts.orderNo}</strong> обновлён:
    </p>
    <p style="display:inline-block;padding:6px 14px;background:#FCE4EC;color:#C2185B;border-radius:20px;font-weight:700;margin:0 0 16px">${statusLine}</p>
    ${
      opts.tracking
        ? `<p style="margin:0 0 8px"><strong>Трек-номер:</strong> ${opts.tracking}${opts.carrier ? ` (${opts.carrier})` : ''}</p>`
        : ''
    }
    ${opts.note ? `<p style="margin:0 0 8px"><strong>Примечание:</strong> ${opts.note}</p>` : ''}
    <p style="margin:16px 0 0;color:#666;font-size:13px">Сумма: ${opts.total.toLocaleString('ko-KR')} ₩</p>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
    <p style="margin:0;font-size:12px;color:#999">Спасибо за покупку!<br>
      <a href="${SITE_URL}" style="color:#E91E63;text-decoration:none">${SITE_URL.replace(/^https?:\/\//, '')}</a>
    </p>
  </div>
</body></html>`;

  return { subject, text, html };
}

Deno.serve(async (req) => {
  const pre = handlePreflight(req);
  if (pre) return pre;
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'missing_auth' }, 401);

  // Verify caller is admin using their JWT.
  const userClient = createClient(SUPABASE_URL, SERVICE_ROLE, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData.user) return json({ error: 'unauthorized' }, 401);

  const { data: profile } = await userClient
    .from('profiles')
    .select('is_admin')
    .eq('id', userData.user.id)
    .single();
  if (!profile?.is_admin) return json({ error: 'forbidden' }, 403);

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  if (!body.order_id || !body.status) {
    return json({ error: 'missing_fields' }, 400);
  }

  // Use service-role client for the write (bypass RLS, we already checked admin).
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  const updates: Record<string, unknown> = { status: body.status };
  if (body.tracking_code !== undefined) updates.tracking_code = body.tracking_code;
  if (body.carrier !== undefined) updates.carrier = body.carrier;
  if (body.note !== undefined) updates.notes = body.note;

  const { data: order, error: updErr } = await admin
    .from('orders')
    .update(updates)
    .eq('id', body.order_id)
    .select('order_no, user_email, total')
    .single();

  if (updErr || !order) {
    console.error('order_update_failed', updErr);
    return json({ error: 'order_update_failed', detail: updErr?.message }, 500);
  }

  // Send email (best-effort — don't fail the request if SMTP is misconfigured).
  const host = Deno.env.get('SMTP_HOST');
  const port = Number(Deno.env.get('SMTP_PORT') ?? '465');
  const user = Deno.env.get('SMTP_USER');
  const pass = Deno.env.get('SMTP_PASS');
  const from = Deno.env.get('MAIL_FROM') ?? user;

  if (!host || !user || !pass || !from) {
    return json({ ok: true, emailed: false, reason: 'smtp_not_configured' });
  }

  const mail = buildEmail({
    orderNo: order.order_no as string,
    status: body.status,
    tracking: body.tracking_code,
    carrier: body.carrier,
    note: body.note,
    total: order.total as number,
  });

  try {
    const { SMTPClient } = await import('npm:emailjs@4');
    const client = new SMTPClient({ user, password: pass, host, port, ssl: port === 465 });
    await client.sendAsync({
      from: from!,
      to: order.user_email as string,
      subject: mail.subject,
      text: mail.text,
      attachment: [{ data: mail.html, alternative: true }],
    });
  } catch (e) {
    console.error('smtp_failed', e);
    return json({ ok: true, emailed: false, reason: 'smtp_failed' });
  }

  return json({ ok: true, emailed: true });
});
