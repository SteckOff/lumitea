# GitHub + Server Setup Guide

Полная инструкция как закинуть файлы на GitHub и настроить автообновление на сервере.

---

## Часть 1: Создание GitHub репозитория

### Шаг 1: Создай репозиторий на GitHub

1. Зайди на https://github.com/new
2. Repository name: `lumitea`
3. Выбери "Private" (частный репозиторий)
4. НЕ добавляй README (у нас уже есть)
5. Click "Create repository"

### Шаг 2: Загрузи файлы на GitHub

На твоём компьютере (MacBook):

```bash
# Перейди в папку с файлами
cd /path/to/lumi-tea-github

# Инициализируй git
git init

# Добавь все файлы
git add .

# Сделай первый коммит
git commit -m "Initial commit - Lumi Tea complete setup"

# Добавь удалённый репозиторий
git remote add origin https://github.com/ТВОЙ_НИК/lumitea.git

# Загрузи на GitHub
git push -u origin main
```

**Готово!** Теперь все файлы на GitHub.

---

## Часть 2: Настройка GitHub Secrets (для автодеплоя)

Это нужно чтобы GitHub мог автоматически обновлять сервер.

### Шаг 1: Добавь Secrets

1. Зайди в свой репозиторий на GitHub
2. Нажми "Settings" (вверху)
3. В левом меню выбери "Secrets and variables" → "Actions"
4. Нажми "New repository secret"

Добавь 3 секрета:

| Name | Value |
|------|-------|
| `SERVER_HOST` | `158.247.225.4` |
| `SERVER_USER` | `root` |
| `SERVER_PASSWORD` | `твой_пароль_от_сервера` |

---

## Часть 3: Настройка сервера

### Шаг 1: Установи git на сервере

```bash
ssh root@158.247.225.4
apt-get update
apt-get install -y git
```

### Шаг 2: Клонируй репозиторий на сервер

```bash
cd /var/www
rm -rf lumitea  # Удали старое если есть

# Клонируй (замени ТВОЙ_НИК на свой GitHub username)
git clone https://github.com/ТВОЙ_НИК/lumitea.git
```

### Шаг 3: Запусти установку

```bash
cd /var/www/lumitea
chmod +x install.sh
./install.sh
```

Этот скрипт установит всё автоматически:
- Node.js
- Nginx
- PM2
- Backend зависимости
- Запустит сервер

### Шаг 4: Настрой SSL (если ещё не сделал)

```bash
certbot --nginx -d lumitea.kr -d www.lumitea.kr
```

---

## Часть 4: Как работает автообновление

Теперь когда ты делаешь изменения:

### На твоём компьютере:

```bash
# Сделал изменения в коде
git add .
git commit -m "Обновил дизайн"
git push origin main
```

### Автоматически на сервере:

1. GitHub Actions видит push
2. Собирает frontend
3. Загружает на сервер
4. Перезапускает backend
5. **Всё обновилось!**

Это занимает ~2-3 минуты.

---

## Часть 5: Структура файлов на сервере

После установки на сервере будет так:

```
/var/www/lumitea/
├── backend/
│   ├── server.js          # Backend код
│   ├── package.json       # Зависимости
│   └── data/              # Данные (users, orders, products)
│       ├── users.json
│       ├── products.json
│       └── orders.json
├── frontend/
│   └── dist/              # Собранный frontend (nginx отсюда раздаёт)
├── frontend-src/          # Исходники frontend (опционально)
├── marketing/             # HTML для Instagram
│   ├── pricelist.html
│   ├── highlight-about.html
│   └── ...
├── install.sh             # Скрипт установки
├── deploy.sh              # Скрипт обновления
└── .git/                  # Git репозиторий
```

---

## Часть 6: Ручное обновление (если авто не работает)

Если автообновление сломалось, обнови вручную:

```bash
ssh root@158.247.225.4
cd /var/www/lumitea

# Скачай последние изменения
git pull origin main

# Обнови backend
cd backend
npm install
pm2 restart lumitea-backend

# Собери frontend
cd /var/www/lumitea/frontend-src
npm install
npm run build
cp -r dist/* /var/www/lumitea/frontend/dist/
```

Или просто:

```bash
ssh root@158.247.225.4
cd /var/www/lumitea
./deploy.sh
```

---

## Часть 7: Что куда закидывать

### Backend изменения:
- Файлы в `backend/` папке
- После push автоматически обновится

### Frontend изменения:
- Файлы в `frontend/src/` папке
- После push GitHub Actions соберёт и загрузит

### Instagram Highlights:
- Файлы в `marketing/` папке
- Это просто HTML для скриншотов

### Настройки сервера:
- `install.sh` - полная установка
- `deploy.sh` - обновление

---

## Часть 8: Проверка статуса

### Проверь что всё работает:

```bash
# Проверь backend
ssh root@158.247.225.4 "pm2 status"

# Проверь логи
ssh root@158.247.225.4 "pm2 logs lumitea-backend --lines 20"

# Проверь API
curl https://lumitea.kr/api/health

# Проверь сайт
curl -I https://lumitea.kr
```

---

## Часть 9: Полезные команды

```bash
# Быстрый деплой
ssh root@158.247.225.4 "cd /var/www/lumitea && ./deploy.sh"

# Перезапустить backend
ssh root@158.247.225.4 "pm2 restart lumitea-backend"

# Посмотреть логи
ssh root@158.247.225.4 "pm2 logs lumitea-backend"

# Проверить git статус
ssh root@158.247.225.4 "cd /var/www/lumitea && git status"

# Обновить с GitHub
ssh root@158.247.225.4 "cd /var/www/lumitea && git pull"
```

---

## Troubleshooting

### Проблема: GitHub Actions падает

**Решение:** Проверь Secrets
1. Settings → Secrets and variables → Actions
2. Убедись что SERVER_HOST, SERVER_USER, SERVER_PASSWORD правильные

### Проблема: Сервер не обновляется

**Решение:**
```bash
ssh root@158.247.225.4
cd /var/www/lumitea
git status
# Если "not a git repository" - клонируй заново
```

### Проблема: Backend не запускается

**Решение:**
```bash
ssh root@158.247.225.4
cd /var/www/lumitea/backend
npm install
pm2 restart lumitea-backend
pm2 logs
```

### Проблема: Frontend не обновился

**Решение:**
```bash
ssh root@158.247.225.4
nginx -t
systemctl reload nginx
```

---

## Итоговый чеклист

- [ ] Создал репозиторий на GitHub
- [ ] Загрузил все файлы
- [ ] Добавил Secrets (SERVER_HOST, SERVER_USER, SERVER_PASSWORD)
- [ ] Установил git на сервере
- [ ] Клонировал репозиторий на сервер
- [ ] Запустил install.sh
- [ ] Настроил SSL
- [ ] Проверил что сайт работает
- [ ] Проверил что API работает
- [ ] Сделал тестовый push и проверил автообновление

---

**Готово!** Теперь при каждом push на GitHub сайт автоматически обновляется.
