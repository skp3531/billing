# RestoPOS — Restaurant POS & Management System

A production-ready, full-stack Restaurant Point of Sale and Management System built for **Shake Sphere** and **Crispy Town**, with multi-tenant/multi-outlet architecture supporting any restaurant business.

---

## Quick Start

### Prerequisites
- Node.js v18+ (v20 recommended)
- MongoDB Atlas account (free tier works)
- npm v9+

### 1. Clone / Open the project
```bash
cd "/Volumes/Personal/antigravity app/billing app"
```

### 2. Set up the Backend
```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB connection string and JWT secrets
npm install
```

### 3. Set up the Frontend
```bash
cd ../client
cp .env.example .env
npm install
```

### 4. Seed the Database
```bash
cd server
npm run seed
```

### 5. Start both servers
```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

Open: http://localhost:5173

---

## Seed Credentials (Development Only)

| Role    | Email                        | Password    |
|---------|------------------------------|-------------|
| Owner   | owner@shakesphere.com        | Owner@123   |
| Manager | manager@shakesphere.com      | Manager@123 |
| Cashier | cashier@shakesphere.com      | Cashier@123 |
| Kitchen | kitchen@shakesphere.com      | Kitchen@123 |

> ⚠️ Change all passwords in production!

---

## Architecture

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB Atlas
- **Auth**: JWT (access token + HTTP-only refresh cookie)
- **State**: Zustand

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

---

## Development Phases

| Phase | Status | Description |
|-------|--------|-------------|
| 1 | ✅ Done | Foundation — Auth, Org, Outlets, Users, Roles |
| 2 | 🔜 Next | Menu + Categories + Products |
| 3 | 🔜 | POS + Cart + Orders + Payments + GST |
| 4 | 🔜 | KOT + Kitchen Display System |
| 5 | 🔜 | Tables + Dine-in |
| 6 | 🔜 | Recipe/BOM + Inventory |
| 7 | 🔜 | Purchasing + Suppliers |
| 8 | 🔜 | Customers + Loyalty |
| 9 | 🔜 | Reports + Dashboard |
| 10 | 🔜 | Printer + Offline + Multi-outlet |

---

## Documentation

- [PROJECT_PLAN.md](./PROJECT_PLAN.md) — Planning document
- [ARCHITECTURE.md](./ARCHITECTURE.md) — System architecture
- [DATABASE.md](./DATABASE.md) — Database schema
- [API.md](./API.md) — API reference
- [SETUP.md](./SETUP.md) — Setup guide
