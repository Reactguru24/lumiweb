# LUXE — Multi-Vendor Fashion Marketplace

A production-quality, mobile-first eCommerce web application for fashion and clothing brands.

## Tech Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Zustand · TanStack Query · Zod
- Tailwind CSS · Chart.js · Sonner
- Mock data with LocalStorage persistence
- Docker (optional)

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Docker (optional)

```bash
docker compose up --build
```

## Demo Accounts

| Role     | Email                   | Password    |
|----------|-------------------------|-------------|
| Admin    | admin@lumiafrica.com    | admin123    |
| Customer | customer@lumiafrica.com | customer123 |
| Vendor   | vendor@lumiafrica.com   | vendor123   |

## Project Structure

```
app/              # Next.js App Router pages & layouts
components/       # Reusable UI components (.tsx)
lib/
├── api/          # Mock API service layer
├── stores/       # Zustand stores
├── hooks/        # React hooks
├── types/        # TypeScript interfaces
├── utils/        # Helpers, validation, storage
├── constants/    # App constants
└── data/         # Seed data generator
public/           # Static assets
```

## Build

```bash
npm run build
npm start
```
