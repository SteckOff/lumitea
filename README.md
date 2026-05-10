# 🍵 LumiTea — Modern Wellness E-commerce Platform

**A direct-to-consumer wellness brand expanding into the South Korean market — full-stack storefront, admin dashboard, and order pipeline built from the ground up.**

![Status](https://img.shields.io/badge/status-active%20development-success)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20TS%20%2B%20Node-blue)
![License](https://img.shields.io/badge/license-Proprietary-lightgrey)

---

## ✨ About

LumiTea is a curated loose-leaf tea brand built for the Korean wellness market. This repository contains the customer-facing storefront, the admin dashboard, and the order management backend — designed, built, and maintained in-house by the founding team.

I'm a **co-founder and lead developer** on the project.

## 🏗️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui |
| **Backend** | Node.js · Express · REST API |
| **Tooling** | ESLint · GitHub Actions · custom deploy scripts |

## ⚡ Features

- 🛍 **Product catalog** with categories, filters, and curated collections
- 🛒 **Cart & checkout flow** with order summary and validation
- 🔐 **Admin dashboard** with drag-and-drop image uploads and product CRUD
- 📦 **Order pipeline** — `pending → confirmed → shipped`
- 📱 **Mobile-first responsive design**
- 🌐 **Built for the Korean market** (i18n-ready)

## 🚀 Quick start

```bash
git clone https://github.com/SteckOff/lumitea.git
cd lumitea
npm install
cp .env.example .env   # configure your environment
npm run dev            # frontend on http://localhost:5173
npm run server         # backend on http://localhost:3001
```

## 📁 Project structure

cd ~/Code/lumitea

############################################
# 1. Удаляем дубль lumi-tea
############################################
gh repo delete SteckOff/lumi-tea --yes

############################################
# 2. Описание + topics для lumitea
############################################
gh repo edit SteckOff/lumitea \
  --description "🍵 Modern wellness e-commerce — React + TypeScript + Node.js. A co-founded brand expanding to the South Korean market." \
  --add-topic react --add-topic typescript --add-topic nodejs \
  --add-topic express --add-topic tailwindcss --add-topic vite \
  --add-topic ecommerce --add-topic shadcn-ui --add-topic full-stack

############################################
# 3. Перезаписываем README на нормальный
############################################
cat > README.md << 'LUMITEA_README_EOF'
# 🍵 LumiTea — Modern Wellness E-commerce Platform

**A direct-to-consumer wellness brand expanding into the South Korean market — full-stack storefront, admin dashboard, and order pipeline built from the ground up.**

![Status](https://img.shields.io/badge/status-active%20development-success)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20TS%20%2B%20Node-blue)
![License](https://img.shields.io/badge/license-Proprietary-lightgrey)

---

## ✨ About

LumiTea is a curated loose-leaf tea brand built for the Korean wellness market. This repository contains the customer-facing storefront, the admin dashboard, and the order management backend — designed, built, and maintained in-house by the founding team.

I'm a **co-founder and lead developer** on the project.

## 🏗️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui |
| **Backend** | Node.js · Express · REST API |
| **Tooling** | ESLint · GitHub Actions · custom deploy scripts |

## ⚡ Features

- 🛍 **Product catalog** with categories, filters, and curated collections
- 🛒 **Cart & checkout flow** with order summary and validation
- 🔐 **Admin dashboard** with drag-and-drop image uploads and product CRUD
- 📦 **Order pipeline** — `pending → confirmed → shipped`
- 📱 **Mobile-first responsive design**
- 🌐 **Built for the Korean market** (i18n-ready)

## 🚀 Quick start

```bash
git clone https://github.com/SteckOff/lumitea.git
cd lumitea
npm install
cp .env.example .env   # configure your environment
npm run dev            # frontend on http://localhost:5173
npm run server         # backend on http://localhost:3001
```

## 📁 Project structure
cd ~/Code/lumitea

############################################
# 1. Удаляем дубль lumi-tea
############################################
gh repo delete SteckOff/lumi-tea --yes

############################################
# 2. Описание + topics для lumitea
############################################
gh repo edit SteckOff/lumitea \
  --description "🍵 Modern wellness e-commerce — React + TypeScript + Node.js. A co-founded brand expanding to the South Korean market." \
  --add-topic react --add-topic typescript --add-topic nodejs \
  --add-topic express --add-topic tailwindcss --add-topic vite \
  --add-topic ecommerce --add-topic shadcn-ui --add-topic full-stack

############################################
# 3. Перезаписываем README на нормальный
############################################
cat > README.md << 'LUMITEA_README_EOF'
# 🍵 LumiTea — Modern Wellness E-commerce Platform

**A direct-to-consumer wellness brand expanding into the South Korean market — full-stack storefront, admin dashboard, and order pipeline built from the ground up.**

![Status](https://img.shields.io/badge/status-active%20development-success)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20TS%20%2B%20Node-blue)
![License](https://img.shields.io/badge/license-Proprietary-lightgrey)

---

## ✨ About

LumiTea is a curated loose-leaf tea brand built for the Korean wellness market. This repository contains the customer-facing storefront, the admin dashboard, and the order management backend — designed, built, and maintained in-house by the founding team.

I'm a **co-founder and lead developer** on the project.

## 🏗️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui |
| **Backend** | Node.js · Express · REST API |
| **Tooling** | ESLint · GitHub Actions · custom deploy scripts |

## ⚡ Features

- 🛍 **Product catalog** with categories, filters, and curated collections
- 🛒 **Cart & checkout flow** with order summary and validation
- 🔐 **Admin dashboard** with drag-and-drop image uploads and product CRUD
- 📦 **Order pipeline** — `pending → confirmed → shipped`
- 📱 **Mobile-first responsive design**
- 🌐 **Built for the Korean market** (i18n-ready)

## 🚀 Quick start

```bash
git clone https://github.com/SteckOff/lumitea.git
cd lumitea
npm install
cp .env.example .env   # configure your environment
npm run dev            # frontend on http://localhost:5173
npm run server         # backend on http://localhost:3001
```

## 📁 Project structure

## 🛣️ Roadmap

- [x] Storefront MVP
- [x] Admin panel with image upload
- [x] Order status pipeline
- [ ] Toss Payments / PortOne integration
- [ ] Korean-language i18n pass
- [ ] Customer order-tracking dashboard

## 📬 Contact

Built by **Grigorii Archakov** — full-stack developer based in Almaty, Kazakhstan.  
Open for freelance & contract work: **archakovgrigorii@gmail.com**

---

⭐ Star this repo if you find the architecture useful.
