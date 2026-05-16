// send-contact — replaces /api/send-contact in legacy server.js.
// Public endpoint (no auth required), rate-limited by IP.

import { handlePreflight, json } from '../_shared/cors.ts';
import { sendMail } from '../_shared/mailer.ts';

interface ContactBody {
  name: string;
  email: string;
  message: string;
  honeypot?: string; // anti-spam: hidden field — if filled, drop silently
}

// Simple in-memory rate limit (per Edge Function instance).
const buckets = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 5;
const WINDOW_MS = 60_000;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || b.reset < now) {
    buckets.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  b.count++;
  return b.count > RATE_LIMIT;
}

Deno.serve(async (req) => {
  const pre = handlePreflight(req);
  if (pre) return pre;
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (rateLimited(ip)) return json({ error: 'rate_limited' }, 429);

  let body: ContactBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  if (body.honeypot) return json({ ok: true }); // silently drop bots

  if (!body.name || !body.email || !body.message) {
    return json({ error: 'missing_fields' }, 400);
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email)) {
    return json({ error: 'bad_email' }, 400);
  }
  if (body.message.length > 5000) return json({ error: 'too_long' }, 400);

  const to = Deno.env.get('CONTACT_TO') ?? Deno.env.get('SMTP_USER');
  if (!to) return json({ error: 'smtp_not_configured' }, 500);

  const res = await sendMail({
    to,
    replyTo: body.email,
    subject: `Lumi Tea — contact from ${body.name}`,
    text: `From: ${body.name} <${body.email}>\n\n${body.message}`,
  });

  if (!res.ok) return json({ error: 'send_failed', detail: res.reason }, 502);
  return json({ ok: true });
});
