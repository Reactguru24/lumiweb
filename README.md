# LUXE — Multi-Vendor Fashion Marketplace

A production-quality, mobile-first eCommerce web application for fashion and clothing brands.

## Tech Stack

- Vue 3 (Composition API) + TypeScript + Vite
- Pinia · Vue Router · TanStack Query
- Tailwind CSS · Headless UI · VueUse
- Chart.js · Zod · Axios
- Mock data with LocalStorage persistence

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Demo Accounts

| Role     | Email              | Password    |
|----------|--------------------|-------------|
| Admin    | admin@luxe.com     | admin123    |
| Customer | customer@luxe.com  | customer123 |
| Vendor   | vendor@luxe.com    | vendor123   |

## Features

### Customer
- Fashion homepage with hero, featured, trending, bestsellers
- Advanced product catalog with filters & sorting
- Product detail with zoom, reviews, wishlist
- Shopping cart with coupons & save-for-later
- Multi-step checkout
- Account dashboard with orders, wishlist, vendor application

### Vendor
- Shopify-style seller dashboard
- Product CRUD with inventory tracking
- Order management with status updates
- Analytics with Chart.js
- Store profile settings

### Admin
- Enterprise dashboard with platform metrics
- User management (search, disable)
- Vendor application approval workflow
- Product moderation
- Order monitoring
- Platform settings (categories, brands, taxes, coupons)

## Project Structure

```
src/
├── api/          # Mock API service layer
├── components/   # Reusable UI components
├── composables/  # Vue composables
├── data/         # Seed data generator
├── layouts/      # Page layouts
├── pages/        # Route pages (auth, customer, vendor, admin)
├── router/       # Vue Router + RBAC guards
├── stores/       # Pinia stores
├── types/        # TypeScript interfaces
└── utils/        # Helpers, validation, storage
```

## Build

```bash
npm run build
npm run preview
```
