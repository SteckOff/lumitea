# Lumi Tea — Flutter mobile app

Android and iOS share one Dart codebase. The Supabase backend lives in
`../backend/supabase`; this app talks to it via `supabase_flutter`.

## One-time setup

1. **Install Flutter 3.24+**: https://docs.flutter.dev/get-started/install
   ```bash
   flutter --version    # verify
   flutter doctor       # fix anything in red
   ```
2. **Materialize the native scaffold** (we shipped only `lib/`, `pubspec.yaml`, and assets;
   the `android/`, `ios/`, `linux/`, etc. folders are generated):
   ```bash
   cd mobile
   flutter create --org kr.lumitea --project-name lumitea .
   flutter pub get
   ```
3. **Drop in branding** into `mobile/assets/images/`:
   ```bash
   cp ../public/logo.png assets/images/logo.png
   cp ../public/tea_collection.jpg assets/images/tea_collection.jpg
   cp ../public/hero_tea.jpg assets/images/hero_tea.jpg
   cp ../public/tea_set.jpg assets/images/tea_set.jpg
   ```
   Then generate launcher icons and splash:
   ```bash
   dart run flutter_launcher_icons
   dart run flutter_native_splash:create
   ```

## Wire up backends

### Supabase
After the backend in `../backend/supabase/README.md` is up, grab `Project URL` and the `anon`
key. Pass them at run-time:

```bash
flutter run \
  --dart-define=SUPABASE_URL=https://your-ref.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1Ni... \
  --dart-define=STRIPE_PK=pk_test_...
```

For convenience, create `mobile/run_dev.sh`:
```bash
#!/usr/bin/env bash
flutter run \
  --dart-define=SUPABASE_URL=$SUPABASE_URL \
  --dart-define=SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY \
  --dart-define=STRIPE_PK=$STRIPE_PK
```

### Firebase Cloud Messaging (push)
1. Firebase Console → "Add app" → Android, package `kr.lumitea`.
2. Download `google-services.json` → put in `mobile/android/app/`.
3. In `mobile/android/build.gradle` (project level), add to plugins:
   ```gradle
   id 'com.google.gms.google-services' version '4.4.2' apply false
   ```
4. In `mobile/android/app/build.gradle`, at the very bottom:
   ```gradle
   apply plugin: 'com.google.gms.google-services'
   ```
5. For iOS: Firebase Console → "Add app" → iOS, bundle `kr.lumitea`. Download
   `GoogleService-Info.plist` and drag into Xcode under `Runner/Runner/`.

### Stripe
1. `mobile/android/app/build.gradle`: bump `minSdkVersion` to **21** (Stripe requirement).
2. iOS: `mobile/ios/Podfile` set `platform :ios, '13.0'`.

## Permissions

### Android — `mobile/android/app/src/main/AndroidManifest.xml`

Inside `<manifest>` (top-level):
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

Inside `<application>`:
```xml
<meta-data
    android:name="com.google.firebase.messaging.default_notification_channel_id"
    android:value="promotions" />
```

### iOS — `mobile/ios/Runner/Info.plist`
```xml
<key>NSCameraUsageDescription</key>
<string>For order delivery photo (not used yet)</string>
```

## Run

```bash
# Pick a device first
flutter devices

# Android emulator
flutter run --dart-define=SUPABASE_URL=... --dart-define=SUPABASE_ANON_KEY=... --dart-define=STRIPE_PK=...
```

## Project layout

```
mobile/lib/
├── main.dart                       — bootstraps Supabase/Stripe/FCM, runs LumiTeaApp
├── core/
│   ├── config.dart                 — env from --dart-define
│   ├── theme.dart                  — Material 3, pink seed (#E91E63), Playfair + Inter
│   ├── router.dart                 — go_router with auth-aware redirects
│   ├── notifications.dart          — FCM init + token sync to public.fcm_tokens
│   ├── models.dart                 — Product / GiftSet / CartItem / Order / Promotion
│   └── providers.dart              — Riverpod: auth, products, cart (with SharedPreferences), orders, promotions
└── features/
    ├── auth/
    │   ├── login_page.dart
    │   ├── register_page.dart
    │   └── verify_email_page.dart  — OTP code entry (requires Supabase template tweak — see below)
    ├── catalog/
    │   ├── catalog_shell.dart      — bottom-nav shell + home grid
    │   └── product_detail_page.dart
    ├── cart/
    │   └── cart_page.dart
    ├── checkout/
    │   └── checkout_page.dart      — Korean address + Stripe PaymentSheet via Edge Function
    ├── orders/
    │   └── orders_page.dart
    ├── profile/
    │   └── profile_page.dart
    └── promotions/
        └── promotions_page.dart
```

## Important: enable 6-digit OTP for email confirmation

Supabase by default sends a click-link to confirm signup. To use the 6-digit code flow our
`verify_email_page.dart` expects:

Supabase Dashboard → Authentication → Email Templates → **Confirm signup**, replace
`{{ .ConfirmationURL }}` with `{{ .Token }}` in both subject and body.

For password reset Supabase still uses a link (see web app — `ResetPasswordPage` handles that
route).

## Release build (Google Play)

```bash
# Generate a keystore once
keytool -genkey -v -keystore ~/lumitea-upload.jks -keyalg RSA -keysize 2048 \
  -validity 10000 -alias upload

# Create android/key.properties:
#   storePassword=...
#   keyPassword=...
#   keyAlias=upload
#   storeFile=/Users/you/lumitea-upload.jks

# Reference it in android/app/build.gradle (signingConfigs / buildTypes release).
# Then:
flutter build appbundle --release \
  --dart-define=SUPABASE_URL=... --dart-define=SUPABASE_ANON_KEY=... \
  --dart-define=STRIPE_PK=pk_live_...

# AAB is at build/app/outputs/bundle/release/app-release.aab — upload to Play Console.
```

## What's NOT here yet (next iterations)

- Korean DaumPostcode WebView in checkout (`KoreanAddressForm` analogue).
- Saved addresses list on profile.
- Order detail page (currently only a list).
- Admin section (manage products, push promotions from phone — admin uses the web for now).
- Localised UI strings via `intl` `.arb` files (we currently have ad-hoc switches for greetings only).
- Apple Pay / Google Pay (works automatically via PaymentSheet when configured in Stripe dashboard).
