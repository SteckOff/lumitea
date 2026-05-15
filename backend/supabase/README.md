# Lumi Tea — Supabase Backend

This folder holds everything that lives in Supabase: schema migrations, RLS policies,
Edge Functions (payments, push, contact form) and one-shot seed scripts.

## What you need before running

1. **Supabase project** — free at https://supabase.com → "New Project". Pick the **Tokyo (ap-northeast-1)** region for low latency from Korea. Save:
   - `Project URL` → `SUPABASE_URL`
   - `anon` key → `VITE_SUPABASE_ANON_KEY` (for web/Flutter clients)
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server only — NEVER commit this)
2. **Supabase CLI** locally — `brew install supabase/tap/supabase`
3. **Stripe account** — https://stripe.com. After signup get:
   - `sk_test_...` (test secret key) → `STRIPE_SECRET_KEY`
   - Webhook signing secret (created in step 5 below) → `STRIPE_WEBHOOK_SECRET`
4. **Firebase project** (for FCM push) — https://console.firebase.google.com → "Add project".
   - Add Android app with package `kr.lumitea`. Download `google-services.json`.
   - Project Settings → Service accounts → "Generate new private key". Save the JSON,
     paste its full content as the value of `FCM_SERVICE_ACCOUNT_JSON`.
   - Project ID → `FCM_PROJECT_ID`
5. **SMTP** — reuse the same Gmail account that `server.js` already used. Generate an
   App Password (Google account → Security → 2FA → App passwords).

## First-time setup

```bash
cd backend/supabase

# Link CLI to the cloud project (one time)
supabase login
supabase link --project-ref <your-project-ref>

# Apply migrations
supabase db push

# Set Edge Function secrets (server-side env)
supabase secrets set \
  STRIPE_SECRET_KEY=sk_test_... \
  STRIPE_WEBHOOK_SECRET=whsec_... \
  FCM_PROJECT_ID=lumitea-xxxxx \
  FCM_SERVICE_ACCOUNT_JSON="$(cat path/to/firebase-service-account.json)" \
  SMTP_HOST=smtp.gmail.com SMTP_PORT=465 \
  SMTP_USER=lumitea.kr@gmail.com SMTP_PASS=<app-password> \
  MAIL_FROM="Lumi Tea <lumitea.kr@gmail.com>" \
  CONTACT_TO=lumitea.kr@gmail.com

# Deploy functions
supabase functions deploy create-payment-intent
supabase functions deploy stripe-webhook --no-verify-jwt
supabase functions deploy send-promotion-push
supabase functions deploy send-contact --no-verify-jwt
```

## Configure Stripe webhook

Once `stripe-webhook` is deployed, copy its URL:
`https://<project-ref>.supabase.co/functions/v1/stripe-webhook`

In Stripe Dashboard → Developers → Webhooks → "Add endpoint":
- URL: the URL above
- Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`

Copy the resulting "Signing secret" (`whsec_...`) and save it as
`STRIPE_WEBHOOK_SECRET` via `supabase secrets set`.

## Seed data

```bash
# 1. Create Storage bucket "product-images" (Public read) in Supabase Dashboard.
# 2. Upload product photos:
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx backend/supabase/seed/upload-images.ts

# 3. Insert products & gift sets:
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx backend/supabase/seed/seed.ts
```

After seeding, in Supabase SQL Editor, edit one row to promote yourself to admin:

```sql
update public.profiles set is_admin = true where email = 'you@example.com';
```

Recommended: also enable TOTP MFA on the admin account from the web app once Phase 2 ships.

## Local development

```bash
supabase start                                 # runs Postgres + Studio + Auth locally
supabase functions serve create-payment-intent --env-file ./.env.local
```

## Useful queries

```sql
-- recent orders
select order_no, status, total, user_email, created_at
  from public.orders order by created_at desc limit 20;

-- low stock alert
select id, name, stock from public.products where stock < 10 order by stock;

-- top tokens by locale
select locale, count(*) from public.fcm_tokens group by locale;
```

## Files

| File                                          | Purpose                                       |
|-----------------------------------------------|-----------------------------------------------|
| `migrations/0001_init.sql`                    | Tables, enums, triggers, order-no generator.  |
| `migrations/0002_rls.sql`                     | Row Level Security policies.                  |
| `migrations/0003_helpers.sql`                 | `decrement_*_stock` RPCs for webhook.         |
| `functions/create-payment-intent/index.ts`    | Server-side cart validation + Stripe PI.      |
| `functions/stripe-webhook/index.ts`           | Marks paid, decrements stock, emails.         |
| `functions/send-promotion-push/index.ts`      | Admin-only broadcast to FCM tokens.           |
| `functions/send-contact/index.ts`             | Public contact form (replaces legacy server.js). |
| `seed/seed.ts`                                | One-shot product/gift-set import.             |
| `seed/upload-images.ts`                       | Bulk upload public/*.jpg to Storage.          |
