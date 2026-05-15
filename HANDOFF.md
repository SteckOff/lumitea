# Lumi Tea — состояние проекта и следующие шаги

План: [/Users/steck/.claude/plans/synchronous-hopping-bentley.md](/Users/steck/.claude/plans/synchronous-hopping-bentley.md)

## Что готово в этой сессии

### ✅ Фаза 1 — Supabase-бекенд (полностью)
Структура: `backend/supabase/`

| Файл | Что делает |
|---|---|
| [migrations/0001_init.sql](backend/supabase/migrations/0001_init.sql) | Все таблицы: profiles, addresses, products, gift_sets, orders, order_items, promotions, subscribers, fcm_tokens. Триггер автосоздания profile при signup. Генератор `order_no` (LT-20260515-0001). |
| [migrations/0002_rls.sql](backend/supabase/migrations/0002_rls.sql) | Row-Level Security: товары читаются всеми, пишутся только админом; заказы видит только владелец; чужой заказ через DevTools не подделаешь. |
| [migrations/0003_helpers.sql](backend/supabase/migrations/0003_helpers.sql) | RPC `decrement_product_stock` и `decrement_gift_set_stock` для атомарного списания остатка. |
| [functions/create-payment-intent/index.ts](backend/supabase/functions/create-payment-intent/index.ts) | Валидирует корзину против БД (цены берутся с сервера, не от клиента), создаёт `pending` заказ, делает Stripe PaymentIntent в KRW. |
| [functions/stripe-webhook/index.ts](backend/supabase/functions/stripe-webhook/index.ts) | Проверяет подпись Stripe, помечает заказ `paid`, списывает остаток, шлёт email-подтверждение. |
| [functions/send-promotion-push/index.ts](backend/supabase/functions/send-promotion-push/index.ts) | Только для админа. Берёт FCM-токены, рассылает пуш с акцией через FCM HTTP v1 API. Мёртвые токены чистит. |
| [functions/send-contact/index.ts](backend/supabase/functions/send-contact/index.ts) | Публичная контакт-форма + rate limit. Заменяет старый `server.js`. |
| [seed/seed.ts](backend/supabase/seed/seed.ts) | Импортирует товары/наборы из `src/data/products.ts` в БД. |
| [seed/upload-images.ts](backend/supabase/seed/upload-images.ts) | Заливает `public/*.jpg` в Supabase Storage. |
| [README.md](backend/supabase/README.md) | Пошаговая инструкция деплоя: что зарегистрировать, какие секреты выставить, как накатить миграции. |

### ✅ Фаза 2 — Веб-фронтенд частично переведён на Supabase

| Файл | Состояние |
|---|---|
| [src/lib/supabase.ts](src/lib/supabase.ts) | ✅ Новый клиент с persistent-сессией. |
| [src/lib/database.types.ts](src/lib/database.types.ts) | ✅ Хэндрайт-типы для БД. |
| [src/context/AuthContext.tsx](src/context/AuthContext.tsx) | ✅ Переписан полностью на Supabase Auth. Сигнатура API сохранена — остальные компоненты не сломались. Добавлены `mfaChallenge`/`mfaVerify` для будущей TOTP в админке. |
| [src/components/AuthModal.tsx](src/components/AuthModal.tsx) | ✅ Убран localStorage-хак. |
| [src/components/EmailVerificationModal.tsx](src/components/EmailVerificationModal.tsx) | ✅ Использует Supabase OTP. |
| [src/components/PasswordResetModal.tsx](src/components/PasswordResetModal.tsx) | ✅ Полностью переделан — теперь шлёт reset-ссылку. |
| [src/pages/ResetPasswordPage.tsx](src/pages/ResetPasswordPage.tsx) | ✅ Новая страница — лендинг для ссылки из письма. **Нужно подключить к роутеру** (см. ниже). |
| [src/hooks/useProducts.ts](src/hooks/useProducts.ts) | ✅ Хук с realtime-обновлением остатков. |
| [package.json](package.json) | ✅ Добавлен `@supabase/supabase-js`. **Запустить `npm install`.** |
| [.env.example](.env.example) | ✅ Шаблон env. |

### ✅ Фаза 3 — Flutter-каркас + базовые экраны
Структура: `mobile/`

| Файл | Что |
|---|---|
| [mobile/pubspec.yaml](mobile/pubspec.yaml) | Зависимости: supabase_flutter, riverpod, go_router, flutter_stripe, firebase_messaging, cached_network_image, google_fonts, intl. |
| [mobile/lib/main.dart](mobile/lib/main.dart) | Bootstrap Supabase + Stripe + FCM. |
| [mobile/lib/core/config.dart](mobile/lib/core/config.dart) | `--dart-define`-конфиги. |
| [mobile/lib/core/theme.dart](mobile/lib/core/theme.dart) | Material 3, розовый seed `#E91E63`, Playfair + Inter. |
| [mobile/lib/core/router.dart](mobile/lib/core/router.dart) | go_router с auth-aware редиректами. |
| [mobile/lib/core/notifications.dart](mobile/lib/core/notifications.dart) | FCM-инициализация, синк токена в `public.fcm_tokens`, обработка foreground-пушей. |
| [mobile/lib/core/models.dart](mobile/lib/core/models.dart) | `Product`, `GiftSet`, `CartItem`, `Address`, `Order`, `Promotion`. |
| [mobile/lib/core/providers.dart](mobile/lib/core/providers.dart) | Riverpod: `authProvider`, `productsProvider`, `cartProvider` (с SharedPreferences-кешем), `myOrdersProvider`, `promotionsProvider`, `localeProvider`. |
| `mobile/lib/features/auth/*.dart` | login, register, verify_email. |
| `mobile/lib/features/catalog/*.dart` | catalog_shell (bottom-nav home), product_detail. |
| `mobile/lib/features/cart/cart_page.dart` | Корзина с qty-стэппером. |
| `mobile/lib/features/checkout/checkout_page.dart` | Адрес + Stripe PaymentSheet через Edge Function. |
| `mobile/lib/features/orders/orders_page.dart` | Список своих заказов. |
| `mobile/lib/features/profile/profile_page.dart` | Профиль + язык + sign out. |
| `mobile/lib/features/promotions/promotions_page.dart` | Лента акций. |
| [mobile/README.md](mobile/README.md) | Полная инструкция: установка, запуск, FCM, Stripe, релиз в Google Play. |

---

## Что ОБЯЗАТЕЛЬНО сделать ТЕБЕ (то, что я не могу из CLI)

1. **Создать Supabase-проект**: https://supabase.com → New Project (регион Tokyo). Сохранить URL, anon-key, service-role-key.
2. **Создать Stripe-аккаунт**: https://stripe.com → активировать тестовый режим. Получить `sk_test_...` и `pk_test_...`.
3. **Создать Firebase-проект**: https://console.firebase.google.com. Добавить Android-app `kr.lumitea`. Скачать `google-services.json`. Создать service-account JSON для отправки пушей с сервера.
4. **Google Play Console**: $25 разовый платёж за аккаунт разработчика.
5. **Установить Flutter 3.24+** локально (без него Android-сборку не сделать).
6. **Установить Supabase CLI**: `brew install supabase/tap/supabase`.
7. **Прочитать [backend/supabase/README.md](backend/supabase/README.md)** — там пошагово, как накатить миграции и задеплоить функции.

---

## Что доделать в коде следующими сессиями

### 🔜 Фаза 2 (остаток веба)

- [ ] **[src/sections/Products.tsx](src/sections/Products.tsx)** — сейчас импортирует массив из `src/data/products.ts`. Заменить на `useProducts()` (хук уже готов). Аналогично [src/sections/GiftSets.tsx](src/sections/GiftSets.tsx) — на `useGiftSets()`.
- [ ] **[src/components/CheckoutForm.tsx](src/components/CheckoutForm.tsx)** — сейчас сохраняет заказ в localStorage. Должен:
  1. Вызвать `supabase.functions.invoke('create-payment-intent', {...})`
  2. Получить `client_secret`
  3. Подтвердить через `@stripe/react-stripe-js` `confirmPayment`
  4. После success — `cart.clear()` и редирект на страницу подтверждения. Заказ сам обновится через webhook.
- [ ] **[src/components/AdminPanel.tsx](src/components/AdminPanel.tsx)** — самая большая работа. План:
  1. Все `localStorage.getItem('lumi_tea_orders')` → `getAllOrders()` (уже async в новом AuthContext).
  2. `localStorage.getItem('lumi_tea_products')` → `supabase.from('products').select()`.
  3. Добавить новую вкладку **Promotions** с формой и кнопкой «Разослать пуш» (вызов `supabase.functions.invoke('send-promotion-push', { promotion_id })`).
  4. **Секретный вход**: убрать видимую кнопку в шапке. Слушать «5 быстрых тапов по логотипу за 2 секунды» — открыть модалку. После пароля → проверка `auth.mfaChallenge()` + `auth.mfaVerify(code)`.
- [ ] **[src/App.tsx](src/App.tsx)** — убрать `lumi_tea_cart`, `lumi_tea_orders` из localStorage-логики. Добавить React Router (или подставить `<ResetPasswordPage />` через `window.location.pathname`-роут) для `/reset-password`.
- [ ] **[server.js](server.js)** и [backend/server.js](backend/server.js) — удалить или заменить заглушкой, которая редиректит на `${VITE_SUPABASE_URL}/functions/v1/send-contact`.
- [ ] `npm install` после обновления `package.json`.

### 🔜 Фаза 4 (Flutter — финальные экраны)

- [ ] **Корейский адресный пикер** — `mobile/lib/features/checkout/widgets/korean_address_form.dart` через `webview_flutter` + `https://t1.daumcdn.net/postcode/api/postcode.v2.js` (порт `KoreanAddressForm.tsx`).
- [ ] **Order detail page** — клик по заказу в `orders_page` → детальная.
- [ ] **Saved addresses** на профиле.
- [ ] **Admin-секция в приложении** — для is_admin показывать таб со списком заказов и кнопкой «Mark printed».
- [ ] **Deeplinks**: при тапе на push → `go_router.push('/promotions/$id')`. Сейчас `notifications.dart` уже передаёт `deeplink` в payload, но в onTap-хендлере он не используется.
- [ ] **i18n через `.arb`** — сейчас локализация ad-hoc. Сгенерировать `flutter gen-l10n`.

### 🔜 Фаза 5–7

- [ ] **Toss Payments / KakaoPay** — отдельная Edge Function `create-toss-payment` + UI выбор метода оплаты.
- [ ] **Apple Pay / Google Pay** — включить в Stripe Dashboard, в `PaymentSheet` они появятся автоматически.
- [ ] **Промо-коды** — endpoint в `create-payment-intent` уже принимает `promo_code`, надо добавить применение скидки в БД и UI «Apply promo code» в чекауте.
- [ ] **Релиз в Google Play** — keystore → AAB → внутренний трек → закрытое тестирование → продакшн (см. [mobile/README.md](mobile/README.md)).

---

## Команды-цпарголки для следующей сессии

```bash
# Веб
cd /Users/steck/Code/lumitea/.claude/worktrees/frosty-jones-33e7df
npm install
cp .env.example .env.local           # затем заполнить VITE_*
npm run dev

# Бекенд (после регистрации в Supabase)
cd backend/supabase
supabase login
supabase link --project-ref <ref>
supabase db push
supabase functions deploy create-payment-intent
supabase functions deploy stripe-webhook --no-verify-jwt
supabase functions deploy send-promotion-push
supabase functions deploy send-contact --no-verify-jwt

# Seed данных
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx backend/supabase/seed/seed.ts
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx backend/supabase/seed/upload-images.ts

# Назначить себя админом
# В Supabase Dashboard → SQL Editor:
update public.profiles set is_admin = true where email = 'you@example.com';

# Mobile
cd mobile
flutter create --org kr.lumitea --project-name lumitea .
flutter pub get
flutter run \
  --dart-define=SUPABASE_URL=https://your-ref.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=eyJhbGciOi... \
  --dart-define=STRIPE_PK=pk_test_...
```

---

## Архитектурные решения, которые я принял (на случай, если что-то надо изменить)

| Решение | Почему |
|---|---|
| Цены KRW как `integer` (без копеек) | У корейской воны нет минорных единиц, Stripe тоже принимает целые. |
| `orders.items` — JSONB-снимок + отдельная `order_items` для отчётов | Если потом изменится цена/название товара — старый заказ всё равно показывает то, что было куплено. |
| `is_admin` ставится только вручную через SQL, нет публичного эндпоинта | Безопасность. Никакой утечки токена не сделает обычного юзера админом. |
| `create-payment-intent` пересчитывает цены на сервере | Клиент может подменить цену в DevTools — сервер этому не верит. |
| `stripe-webhook` имеет `verify_jwt = false` | Stripe не присылает Supabase-токен; защита через signing-secret. |
| Реалтайм на products | Когда админ меняет stock — клиенты видят сразу, как у Starbucks с «sold out». |
| OTP-код для email вместо ссылки | Лучший UX на мобиле. Требует один tweak шаблона в Supabase (см. mobile/README.md). |
| Локальная корзина до логина | Не теряется при перезапуске. Синк в БД — задача будущей фазы. |
| Flutter, не нативный Kotlin | Один кодбейз под Android + iOS, при этом качество близко к нативу. |
| Riverpod, не Bloc | Меньше boilerplate для CRUD-приложения этого размера. |
| go_router, не auto_route | Стандарт для Flutter, проще mfa-redirects. |
