# Lumi Tea — Инструкция по установке и сборке

Полное руководство по развёртыванию **веб-сайта**, **Supabase-бекенда** и **Flutter-приложения** (Android).

---

## Содержание

1. [Требования](#1-требования)
2. [Быстрый старт (локальная разработка)](#2-быстрый-старт)
3. [Supabase бекенд](#3-supabase-бекенд)
4. [Веб-сайт (React + Vite)](#4-веб-сайт)
5. [Flutter-приложение (Android)](#5-flutter-приложение)
6. [Переменные окружения](#6-переменные-окружения)
7. [Сборка для продакшна](#7-сборка-для-продакшна)
8. [Деплой](#8-деплой)
9. [Частые проблемы](#9-частые-проблемы)

---

## 1. Требования

### Обязательно для всего

| Инструмент | Версия | Установка |
|---|---|---|
| Node.js | ≥ 20 | https://nodejs.org |
| Git | любая | https://git-scm.com |
| Supabase CLI | ≥ 1.200 | `npm install -g supabase` |

### Только для Flutter

| Инструмент | Версия | Установка |
|---|---|---|
| Flutter SDK | ≥ 3.24 | https://docs.flutter.dev/get-started/install |
| Android Studio | ≥ Koala | https://developer.android.com/studio |
| Java JDK | 17 | входит в Android Studio |
| Android SDK | API 35 | через Android Studio SDK Manager |

### Аккаунты (внешние сервисы)

| Сервис | Зачем | Уровень |
|---|---|---|
| [Supabase](https://supabase.com) | БД, Auth, Storage, Edge Functions | Free |
| [Stripe](https://stripe.com) | Платежи | Free (test mode) |
| [Firebase](https://firebase.google.com) | Push-уведомления (FCM) | Free |
| [Vercel](https://vercel.com) | Хостинг веб-сайта | Free |

---

## 2. Быстрый старт

```bash
# Клонировать репозиторий
git clone https://github.com/SteckOff/lumitea.git
cd lumitea

# Настроить переменные окружения
cp .env.example .env
# → Откройте .env и заполните VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY

# Установить зависимости и запустить сайт
npm install
npm run dev
# Сайт откроется на http://localhost:5173
```

> На этом этапе сайт работает с **реальной Supabase БД** (если вы заполнили .env).  
> Без .env сайт покажет статические данные из `src/data/products.ts`.

---

## 3. Supabase бекенд

### 3.1 Создать проект

1. Зайдите на https://supabase.com → New project
2. Выберите регион **Northeast Asia (Seoul)**
3. Запомните:
   - Project URL: `https://XXXXXXXX.supabase.co`
   - anon public key (Settings → API)
   - service_role key (Settings → API, скрытый)

### 3.2 Применить миграции БД

```bash
# Привязать CLI к проекту
supabase link --project-ref XXXXXXXX

# Применить миграции (создаёт все таблицы + RLS)
supabase db push
```

Миграции находятся в `backend/supabase/migrations/`:
- `0001_init.sql` — схема таблиц (products, gift_sets, orders, profiles, etc.)
- `0002_rls.sql` — Row Level Security правила
- `0003_helpers.sql` — вспомогательные функции

### 3.3 Залить начальные данные

```bash
cd backend/supabase/seed

# Установить зависимости сидера
npm install

# Залить товары из src/data/products.ts в БД
SUPABASE_URL=https://XXXXXXXX.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
npx ts-node seed.ts
```

### 3.4 Настроить Auth (Email подтверждение)

В Supabase Dashboard → Authentication → Settings:
- **Site URL**: `https://lumitea.kr` (или `http://localhost:5173` для разработки)
- **Redirect URLs**: добавить `https://lumitea.kr/reset-password`
- **SMTP** (опционально): подключить Gmail для брендированных писем (Authentication → Settings → SMTP)

### 3.5 Задеплоить Edge Functions

```bash
# Установить секреты (один раз)
supabase secrets set \
  STRIPE_SECRET_KEY=sk_test_... \
  STRIPE_WEBHOOK_SECRET=whsec_... \
  FCM_PROJECT_ID=lumitea-xxxxx \
  FCM_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}' \
  SMTP_HOST=smtp.gmail.com \
  SMTP_PORT=465 \
  SMTP_USER=lumitea.kr@gmail.com \
  SMTP_PASS=your-app-password \
  MAIL_FROM="Lumi Tea <lumitea.kr@gmail.com>" \
  CONTACT_TO=lumitea.kr@gmail.com

# Задеплоить все функции
supabase functions deploy create-payment-intent
supabase functions deploy stripe-webhook
supabase functions deploy send-promotion-push
supabase functions deploy send-contact
```

### 3.6 Настроить Stripe Webhook

В Stripe Dashboard → Webhooks → Add endpoint:
- URL: `https://XXXXXXXX.supabase.co/functions/v1/stripe-webhook`
- Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
- Скопировать Signing Secret → `STRIPE_WEBHOOK_SECRET`

### 3.7 Настроить хранилище фото

```bash
# В Supabase Dashboard → Storage → New bucket
# Имя: product-images, Public: yes

# Загрузить картинки товаров (из public/)
supabase storage cp public/hero_tea.jpg ss:///product-images/
supabase storage cp public/tea_collection.jpg ss:///product-images/
supabase storage cp public/tea_set.jpg ss:///product-images/
```

---

## 4. Веб-сайт

### 4.1 Переменные окружения

Создайте файл `.env` (скопируйте из `.env.example`):

```env
VITE_SUPABASE_URL=https://XXXXXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 4.2 Локальная разработка

```bash
npm install
npm run dev          # http://localhost:5173
```

### 4.3 Сборка

```bash
npm run build        # выходные файлы в dist/
npm run preview      # предпросмотр собранной версии
```

### 4.4 Настроить администратора

После регистрации через сайт выдать себе права администратора в Supabase Dashboard → SQL Editor:

```sql
UPDATE profiles
SET is_admin = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'ваш@email.com');
```

Вход в админку: **5 кликов по логотипу в шапке** за 2 секунды.

---

## 5. Flutter-приложение

### 5.1 Подготовка окружения

```bash
# Проверить, что Flutter установлен правильно
flutter doctor

# Должны быть зелёные:
# [✓] Flutter
# [✓] Android toolchain
# [✓] Android Studio
```

### 5.2 Перейти в папку приложения

```bash
cd mobile
```

### 5.3 Настроить переменные

Создайте файл `mobile/lib/core/config.dart`:

```dart
// НЕ коммитьте этот файл в git (добавлен в .gitignore)
const supabaseUrl = 'https://XXXXXXXX.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const stripePublishableKey = 'pk_test_...';
```

> Или используйте `--dart-define` при сборке (см. раздел 7.3).

### 5.4 Настроить Firebase (Push-уведомления)

1. Firebase Console → Add project `lumitea`
2. Add Android app, package name: `kr.lumitea`
3. Скачать `google-services.json` → положить в `mobile/android/app/`
4. Включить Cloud Messaging в Firebase Console

```bash
# Установить FlutterFire CLI
dart pub global activate flutterfire_cli

# Автонастройка
flutterfire configure --project=lumitea-xxxxx
```

### 5.5 Установить зависимости

```bash
cd mobile
flutter pub get
```

### 5.6 Запустить на эмуляторе

```bash
# Создать эмулятор (если нет)
flutter emulators --create --name pixel_7

# Запустить
flutter emulators --launch pixel_7
flutter run
```

### 5.7 Запустить на реальном устройстве

```bash
# Включить режим разработчика на телефоне (Settings → About → tap Build number ×7)
# Подключить по USB

# Проверить, что устройство видно
flutter devices

# Запустить
flutter run -d <device-id>
```

---

## 6. Переменные окружения

### Веб (.env)

| Переменная | Описание |
|---|---|
| `VITE_SUPABASE_URL` | URL проекта Supabase |
| `VITE_SUPABASE_ANON_KEY` | Публичный anon-ключ Supabase |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Публичный ключ Stripe |

### Supabase Edge Functions (через `supabase secrets set`)

| Переменная | Описание |
|---|---|
| `STRIPE_SECRET_KEY` | Секретный ключ Stripe (`sk_test_...` / `sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Подпись вебхука Stripe (`whsec_...`) |
| `FCM_PROJECT_ID` | ID проекта Firebase |
| `FCM_SERVICE_ACCOUNT_JSON` | JSON service account для FCM HTTP v1 API |
| `SMTP_HOST` | SMTP хост (например `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP порт (465 для SSL, 587 для TLS) |
| `SMTP_USER` | Email отправителя |
| `SMTP_PASS` | App Password Gmail (не основной пароль!) |
| `MAIL_FROM` | Имя + email в поле From |
| `CONTACT_TO` | Куда приходят письма с формы обратной связи |

### Flutter (lib/core/config.dart или --dart-define)

| Переменная | Описание |
|---|---|
| `SUPABASE_URL` | URL проекта Supabase |
| `SUPABASE_ANON_KEY` | Публичный anon-ключ |
| `STRIPE_PUBLISHABLE_KEY` | Публичный ключ Stripe |

---

## 7. Сборка для продакшна

### 7.1 Веб-сайт

```bash
# Убедиться что в .env стоят prod-значения
npm run build
# Папка dist/ готова к деплою
```

### 7.2 Flutter — Debug APK (для тестирования)

```bash
cd mobile
flutter build apk --debug
# APK: build/app/outputs/flutter-apk/app-debug.apk
```

### 7.3 Flutter — Release App Bundle (для Google Play)

```bash
# 1. Создать keystore (один раз)
keytool -genkey -v \
  -keystore android/app/lumitea-release.jks \
  -alias lumitea \
  -keyalg RSA -keysize 2048 -validity 10000

# 2. Создать android/key.properties
cat > android/key.properties << 'EOF'
storePassword=your-store-password
keyPassword=your-key-password
keyAlias=lumitea
storeFile=lumitea-release.jks
EOF

# 3. Собрать App Bundle
flutter build appbundle --release \
  --dart-define=SUPABASE_URL=https://XXXXXXXX.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=eyJ... \
  --dart-define=STRIPE_PUBLISHABLE_KEY=pk_live_...

# AAB готов: build/app/outputs/bundle/release/app-release.aab
```

### 7.4 Flutter — Сгенерировать иконки и сплэш

```bash
cd mobile

# Положить лого в assets/images/logo.png (минимум 1024×1024 px)

# Сгенерировать иконки
dart run flutter_launcher_icons

# Сгенерировать сплэш-экран
dart run flutter_native_splash:create
```

---

## 8. Деплой

### 8.1 Веб-сайт на Vercel

```bash
# Установить Vercel CLI
npm install -g vercel

# Первый деплой (спросит про проект)
vercel

# Производственный деплой
vercel --prod
```

Или через GitHub: подключить репозиторий в Vercel Dashboard, переменные окружения задать в Settings → Environment Variables.

### 8.2 Веб-сайт на своём VPS (Nginx)

```bash
# Собрать
npm run build

# Скопировать на сервер
rsync -avz dist/ user@lumitea.kr:/var/www/lumitea/

# Nginx конфиг (упрощённый)
# location / {
#   root /var/www/lumitea;
#   try_files $uri $uri/ /index.html;
# }
```

### 8.3 Приложение в Google Play

1. Google Play Console → Create app
2. Release → Production → Create new release
3. Загрузить `app-release.aab`
4. Заполнить:
   - Store listing (описание EN + KO, скриншоты)
   - Content rating
   - Data safety (Stripe: финансовые данные; FCM: идентификатор устройства)
   - Политика конфиденциальности: `https://lumitea.kr/privacy`
5. Review → Publish

---

## 9. Частые проблемы

### `supabase db push` зависает или падает

```bash
# Убедиться, что CLI привязан к правильному проекту
supabase projects list
supabase link --project-ref ПРАВИЛЬНЫЙ_REF
```

### Flutter: `flutter doctor` показывает ошибки Android SDK

```
# В Android Studio: Tools → SDK Manager → SDK Platforms
# Установить Android API 35
# Tools → SDK Manager → SDK Tools → проверить "Android SDK Build-Tools"
```

### Flutter: ошибка при gradle build

```bash
cd mobile/android
./gradlew --stop        # остановить gradle daemon
flutter clean
flutter pub get
flutter run
```

### Stripe webhook не приходит локально

```bash
# Установить Stripe CLI
brew install stripe/stripe-cli/stripe

# Форвардить вебхуки локально
stripe listen --forward-to https://XXXXXXXX.supabase.co/functions/v1/stripe-webhook
```

### TypeScript ошибки типов Supabase в веб

Если `supabase-js` ругается на типы — сгенерировать их заново:

```bash
supabase gen types typescript --project-id XXXXXXXX > src/lib/database.types.ts
```

### Приложение не получает push-уведомления

1. Убедиться, что `google-services.json` лежит в `mobile/android/app/`
2. В Firebase Console включить Cloud Messaging API
3. Проверить, что пользователь дал разрешение на уведомления при первом запуске
4. В Supabase Dashboard → Logs → Edge Functions проверить логи `send-promotion-push`

---

## Структура репозитория

```
lumitea/
├── src/                        # Веб-сайт (React + TypeScript + Vite)
│   ├── components/             # UI-компоненты
│   ├── sections/               # Секции лендинга (Hero, Products, GiftSets…)
│   ├── pages/                  # Отдельные страницы (Blog, FAQ, ResetPassword)
│   ├── hooks/                  # React-хуки (useProducts, useGiftSets…)
│   ├── context/                # AuthContext
│   ├── lib/                    # supabase.ts, database.types.ts
│   └── data/                   # Статические данные (fallback при загрузке)
│
├── backend/
│   └── supabase/
│       ├── migrations/         # SQL-миграции (0001_init, 0002_rls, 0003_helpers)
│       ├── functions/          # Edge Functions (Deno/TypeScript)
│       │   ├── create-payment-intent/
│       │   ├── stripe-webhook/
│       │   ├── send-promotion-push/
│       │   └── send-contact/
│       └── seed/               # Скрипт начального заполнения БД
│
├── mobile/                     # Flutter-приложение (Android + iOS)
│   ├── lib/
│   │   ├── core/               # Supabase client, провайдеры, роутер, модели, тема
│   │   └── features/
│   │       ├── auth/           # Вход, регистрация, сброс пароля
│   │       ├── catalog/        # Каталог товаров, подарочные наборы
│   │       ├── cart/           # Корзина
│   │       ├── checkout/       # Оформление заказа + DaumPostcode
│   │       ├── orders/         # Список заказов, детали заказа
│   │       ├── profile/        # Профиль, язык, выход
│   │       ├── promotions/     # Список акций
│   │       └── admin/          # Панель администратора (только is_admin=true)
│   ├── assets/images/          # Логотип и прочие ресурсы
│   └── pubspec.yaml
│
├── public/                     # Статические файлы сайта (фото, лого)
├── .env.example                # Шаблон переменных окружения
├── SETUP.md                    # Этот файл
└── DEPLOYMENT_GUIDE.md         # Детальный гайд по деплою
```
