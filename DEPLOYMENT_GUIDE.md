# Lumi Tea - Руководство по развёртыванию

## 📦 Структура проекта

```
lumi-tea/
├── server.js          # Node.js сервер с API
├── package.json       # Зависимости
├── vite.config.ts     # Конфигурация Vite
├── .env.example       # Пример переменных окружения
├── dist/              # Сборка фронтенда (создаётся при build)
├── public/            # Статические файлы
└── src/               # Исходный код React
```

## 🚀 Рекомендуемый хостинг: Render.com

### Почему Render?
- ✅ Бесплатный тариф для веб-сервисов
- ✅ Бесплатная PostgreSQL (опционально)
- ✅ Автоматический деплой из GitHub
- ✅ Поддержка Node.js
- ✅ HTTPS по умолчанию

### Шаг 1: Подготовка

1. Создайте аккаунт на GitHub: https://github.com
2. Создайте новый репозиторий (например, `lumi-tea`)
3. Загрузите файлы проекта:

```bash
cd lumi-tea
# Инициализируйте git (если ещё не сделано)
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/lumi-tea.git
git push -u origin main
```

### Шаг 2: Создание сервиса на Render

1. Перейдите на https://render.com и создайте аккаунт
2. Нажмите "New" → "Web Service"
3. Подключите ваш GitHub репозиторий
4. Настройте:
   - **Name**: `lumi-tea`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

5. Добавьте переменные окружения:
   - `NODE_ENV`: `production`
   - `VITE_STRIPE_PUBLIC_KEY`: `pk_test_51RU5upQuiZH39Uf8nXoLNWMGBrQ2r8zUkHoCErfQs5cawWRKkNzsthEi0CCvt43y1AlvevcuB7jOqj5HPAq6WvA800GPLrkddU`

6. Нажмите "Create Web Service"

### Шаг 3: Настройка домена

1. В панели Render перейдите в настройки сервиса
2. Нажмите "Custom Domain"
3. Введите: `lumitea.kr` (или ваш домен)
4. Следуйте инструкциям для настройки DNS

### Шаг 4: Регистрация домена

#### Вариант 1: Gabia (для .kr доменов)
1. Перейдите на https://www.gabia.com
2. Зарегистрируйтесь и найдите домен `lumitea.kr`
3. Оплатите (~30,000-50,000 KRW/год)
4. В настройках DNS добавьте:
   - Тип: `CNAME`
   - Имя: `@`
   - Значение: `your-service-name.onrender.com`

#### Вариант 2: Namecheap (для международных доменов)
1. Перейдите на https://www.namecheap.com
2. Найдите и купите домен
3. В настройках DNS добавьте:
   - Тип: `CNAME`
   - Хост: `@`
   - Значение: `your-service-name.onrender.com`

## 🔧 Локальная разработка

```bash
# Установка зависимостей
npm install

# Запуск сервера разработки (фронтенд)
npm run dev

# В отдельном терминале - запуск API сервера
npm run server

# Сборка для production
npm run build
```

## 📧 Настройка Gmail App Password

Gmail App Password уже настроен в `server.js`:
- Email: `lumitea.kr@gmail.com`
- App Password: `vslucdrfofunlxlx`

Если нужно изменить:
1. Перейдите в https://myaccount.google.com/apppasswords
2. Создайте новый App Password
3. Обновите в `server.js`

## 🔐 Админ доступ

- **Email**: `admin@lumitea.kr`
- **Пароль**: `LumiTea2025!`

## 📝 API Endpoints

| Endpoint | Method | Описание |
|----------|--------|----------|
| `/api/send-verification` | POST | Отправка кода подтверждения |
| `/api/send-contact` | POST | Отправка контактной формы |
| `/api/subscribe` | POST | Подписка на новости |
| `/api/send-chat` | POST | Отправка чата в поддержку |
| `/api/send-reset-code` | POST | Отправка кода сброса пароля |

## 🛠️ Устранение неполадок

### Проблема: Email не отправляются
1. Проверьте, что Gmail App Password правильный
2. Убедитесь, что в Google Account включена двухфакторная аутентификация
3. Проверьте логи на Render: `Logs` → `Web Service`

### Проблема: Сайт не загружается
1. Проверьте, что `npm run build` успешно завершился
2. Проверьте, что `dist` папка создана
3. Проверьте логи на Render

### Проблема: Изменения в админке не отображаются
1. Обновите страницу (F5)
2. Проверьте localStorage в DevTools → Application → Local Storage
3. Убедитесь, что нажали кнопку "Apply Changes"

## 📞 Поддержка

- Email: lumitea.kr@gmail.com
- Telegram: @lumi_chai
- Instagram: @_lumi__tea_

---

*Последнее обновление: 9 марта 2026*
