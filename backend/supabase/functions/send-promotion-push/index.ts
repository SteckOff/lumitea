// send-promotion-push
// Called by the web admin (or admin section of the app) when an admin wants to broadcast
// a promotion to every registered FCM token. Uses FCM HTTP v1 (OAuth2).
//
// Auth: caller must be authenticated AND public.is_admin() = true.
// Env:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//   FCM_PROJECT_ID            — Firebase project id
//   FCM_SERVICE_ACCOUNT_JSON  — full JSON of the service account key (paste in Supabase secrets)

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { create, getNumericDate } from 'jsr:@djwt/core@3';   // JWT for Google OAuth2
import { handlePreflight, json } from '../_shared/cors.ts';

interface RequestBody {
  promotion_id: number;
  deeplink?: string;       // e.g. "/promotions/123"
  test_token?: string;     // if set, sends only to this one token (for dry-runs)
}

interface ServiceAccount {
  client_email: string;
  private_key: string;
  token_uri: string;
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;

  // Convert PEM private key to CryptoKey
  const pem = sa.private_key.replace(/\\n/g, '\n');
  const pkBody = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s+/g, '');
  const der = Uint8Array.from(atob(pkBody), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    'pkcs8',
    der,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const jwt = await create(
    { alg: 'RS256', typ: 'JWT' },
    {
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: sa.token_uri,
      iat: getNumericDate(0),
      exp: getNumericDate(60 * 60),
    },
    key,
  );

  const res = await fetch(sa.token_uri, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`token exchange failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.value;
}

Deno.serve(async (req) => {
  const pre = handlePreflight(req);
  if (pre) return pre;
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const auth = req.headers.get('Authorization');
  if (!auth) return json({ error: 'unauthorized' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const projectId = Deno.env.get('FCM_PROJECT_ID');
  const saJson = Deno.env.get('FCM_SERVICE_ACCOUNT_JSON');

  if (!projectId || !saJson) {
    return json({ error: 'fcm_not_configured' }, 500);
  }

  // Verify caller is admin
  const userClient = createClient(supabaseUrl, serviceKey, {
    global: { headers: { Authorization: auth } },
  });
  const { data: userData } = await userClient.auth.getUser();
  if (!userData?.user) return json({ error: 'unauthorized' }, 401);

  const admin = createClient(supabaseUrl, serviceKey);
  const { data: profile } = await admin
    .from('profiles')
    .select('is_admin')
    .eq('id', userData.user.id)
    .single();
  if (!profile?.is_admin) return json({ error: 'forbidden' }, 403);

  // Parse request
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  // Load promotion
  const { data: promo, error: promoErr } = await admin
    .from('promotions')
    .select('*')
    .eq('id', body.promotion_id)
    .single();
  if (promoErr || !promo) return json({ error: 'promotion_not_found' }, 404);

  // Load tokens
  const tokens: { token: string; locale: string }[] = body.test_token
    ? [{ token: body.test_token, locale: 'en' }]
    : (await admin.from('fcm_tokens').select('token, locale')).data ?? [];

  if (tokens.length === 0) return json({ ok: true, sent: 0, note: 'no_tokens' });

  const sa: ServiceAccount = JSON.parse(saJson);
  const accessToken = await getAccessToken(sa);

  const fcmUrl = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
  let sent = 0;
  let failed = 0;
  const deadTokens: string[] = [];

  for (const t of tokens) {
    const title =
      t.locale === 'ko' ? promo.title_ko :
      t.locale === 'ru' ? promo.title_ru :
      promo.title;
    const bodyText =
      t.locale === 'ko' ? promo.body_ko :
      t.locale === 'ru' ? promo.body_ru :
      promo.body;

    const message = {
      message: {
        token: t.token,
        notification: { title, body: bodyText, image: promo.image_url ?? undefined },
        data: {
          type: 'promotion',
          promotion_id: String(promo.id),
          deeplink: body.deeplink ?? `/promotions/${promo.id}`,
        },
        android: {
          priority: 'high',
          notification: { channel_id: 'promotions' },
        },
        apns: {
          payload: { aps: { sound: 'default', 'mutable-content': 1 } },
          fcm_options: promo.image_url ? { image: promo.image_url } : undefined,
        },
      },
    };

    const res = await fetch(fcmUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (res.ok) {
      sent++;
    } else {
      failed++;
      const errBody = await res.text();
      // Token invalid/unregistered → mark for deletion
      if (errBody.includes('UNREGISTERED') || errBody.includes('INVALID_ARGUMENT')) {
        deadTokens.push(t.token);
      }
    }
  }

  if (deadTokens.length) {
    await admin.from('fcm_tokens').delete().in('token', deadTokens);
  }

  if (!body.test_token) {
    await admin.from('promotions').update({
      pushed_at: new Date().toISOString(),
      push_sent_count: (promo.push_sent_count ?? 0) + sent,
    }).eq('id', promo.id);
  }

  return json({ ok: true, sent, failed, dead_tokens_removed: deadTokens.length });
});
