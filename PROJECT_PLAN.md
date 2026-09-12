# PROJECT_PLAN.md — Restaurant POS System

## 1. Project Overview

**RestoPOS** is a full-stack, multi-tenant Restaurant Point of Sale and Management System.

Initial businesses: **Shake Sphere** and **Crispy Town**  
Architecture: Generic, supports any restaurant with multiple outlets.

---

## 2. Current Architecture (Inspection Results)

| Item | Finding |
|------|---------|
| Existing code | None — completely new greenfield project |
| Node.js | v20.14.0 available |
| npm | v10.7.0 available |
| MongoDB local | Not installed (using Atlas cloud) |
| Firebase CLI | Not installed (not using Firebase) |
| Database | MongoDB Atlas (cloud, free M0 tier) |

---

## 3. Proposed Architecture

### Frontend Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18 | UI framework |
| TypeScript | 5.3 | Type safety |
| Vite | 5 | Build tool + dev server |
| Tailwind CSS | 3 | Utility CSS |
| React Router | 6 | Client-side routing |
| Zustand | 4 | Global state management |
| Axios | 1.6 | HTTP client |
| react-hook-form | 7 | Form management |
| zod | 3 | Schema validation |
| react-hot-toast | 2 | Notifications |
| @heroicons/react | 2 | SVG icons |

### Backend Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20 | Runtime |
| Express | 4.18 | REST framework |
| TypeScript | 5.3 | Type safety |
| Mongoose | 8 | MongoDB ODM |
| bcryptjs | 2.4 | Password hashing |
| jsonwebtoken | 9 | JWT auth |
| express-validator | 7 | Input validation |
| helmet | 7 | Security headers |
| cors | 2.8 | CORS handling |
| morgan | 1.10 | HTTP logging |
| cookie-parser | 1.4 | Cookie handling |

### Database
- **MongoDB Atlas** — Cloud hosted, free M0 tier
- Multi-tenant via `organizationId` field on every document
- Single cluster, multiple collections

---

## 4. Database Architecture

### Collections
```
organizations     — Restaurant/business entities
outlets           — Physical locations per organization
users             — Staff with role-based access
roles             — Permission groups
audit_logs        — Immutable activity trail
```

### Multi-tenancy Model
```
Organization (Shake Sphere)
  └── Outlet (Main Outlet)
        └── Users (Owner, Manager, Cashier, Kitchen...)
              └── Roles (OWNER, MANAGER, CASHIER...)
                    └── Permissions (pos.create_order, menu.manage...)
```

### Tenant Isolation
- Every business record has `organizationId`
- Backend middleware NEVER trusts organizationId from request body
- Always uses `req.user.organizationId` from validated JWT token

---

## 5. Authentication Design

### Flow
1. User POSTs email/password to `POST /api/auth/login`
2. Server validates credentials (bcrypt compare)
3. Server issues:
   - **Access Token** (JWT, 15 min expiry) → returned in response body
   - **Refresh Token** (JWT, 7 days) → set as HTTP-only cookie (not accessible by JS)
4. Frontend stores access token in Zustand memory state (NOT localStorage)
5. On every API request, Axios interceptor attaches `Authorization: Bearer <token>`
6. On 401 (token expired), Axios interceptor calls `POST /api/auth/refresh`
7. If refresh succeeds → new access token → retry original request
8. If refresh fails → logout → redirect to /login

### Security Decisions
- Access token in memory (XSS safe — not in localStorage)
- Refresh token in HTTP-only cookie (CSRF mitigated by SameSite=strict)
- No Firebase dependency (more control, works offline)
- bcrypt rounds = 12 (secure, not too slow)

---

## 6. Authorization Design

### Role Hierarchy
```
OWNER           — Full access to everything
MANAGER         — Full ops, no system settings
CASHIER         — POS, billing, cash management
WAITER          — Order taking only
KITCHEN         — Kitchen display, order viewing
INVENTORY_MGR   — Stock, purchases, suppliers
ACCOUNTANT      — Reports, expenses, cash (read)
```

### Permission Checking
- **Frontend**: Permission gates hide UI elements (UX, not security)
- **Backend**: Every protected route checks permissions server-side (real security)
- `requirePermission('pos.create_order')` middleware on every API

---

## 7. Main Modules (All Phases)

| Module | Phase | Status |
|--------|-------|--------|
| Authentication | 1 | ✅ |
| Organization Setup | 1 | ✅ |
| Outlet Management | 1 | ✅ |
| User Management | 1 | ✅ |
| Role Management | 1 | ✅ |
| Audit Logs | 1 | ✅ (infrastructure) |
| App Shell (Sidebar, TopBar) | 1 | ✅ |
| Menu Management | 2 | 🔜 |
| POS + Billing | 3 | 🔜 |
| Orders | 3 | 🔜 |
| GST Calculations | 3 | 🔜 |
| Kitchen Display | 4 | 🔜 |
| Table Management | 5 | 🔜 |
| Inventory | 6 | 🔜 |
| Purchases | 7 | 🔜 |
| Suppliers | 7 | 🔜 |
| Customers + Loyalty | 8 | 🔜 |
| Reports + Dashboard | 9 | 🔜 |
| Printer + Offline | 10 | 🔜 |

---

## 8. Risk Register

| Risk | Impact | Mitigation |
|------|--------|-----------|
| MongoDB Atlas connectivity | High | Use MONGO_URI env var; fallback error on startup |
| Token refresh loop | Medium | Single retry with guard flag |
| Multi-outlet data isolation | High | Always filter by org + outlet in queries |
| GST compliance changes | Medium | Config-driven GST rates |
| Offline POS | High | Phase 10 — IndexedDB + sync |
| Printer compatibility | Medium | Phase 10 — ESC/POS + web printing |

---

## 9. Implementation Order (Phase 1)

1. ✅ Backend: package.json, tsconfig, nodemon config
2. ✅ Backend: Config (env, db)
3. ✅ Backend: Models (Organization, Outlet, User, Role, AuditLog)
4. ✅ Backend: Utils (JWT, permissions, apiResponse, auditLog)
5. ✅ Backend: Middleware (authenticate, authorize, errorHandler, asyncHandler)
6. ✅ Backend: Validators
7. ✅ Backend: Services + Controllers + Routes
8. ✅ Backend: Seed script
9. ✅ Frontend: project scaffold (Vite + Tailwind)
10. ✅ Frontend: Types + Zustand stores + Axios
11. ✅ Frontend: UI components (Button, Input, Modal, etc.)
12. ✅ Frontend: Login page
13. ✅ Frontend: App layout (Sidebar + TopBar + OutletSelector)
14. ✅ Frontend: Protected routes + Permission guards
15. ✅ Frontend: Dashboard + Coming Soon pages
16. ✅ Frontend: Users, Roles, Outlets, Settings pages
17. ✅ Documentation

---

## 10. Future Architecture Notes

- Phase 2+: Extend models with `outletId` field per transaction
- Phase 3: Add `invoices`, `orders`, `order_items` collections
- Phase 6: Add `recipes`, `ingredients`, `stock_movements` collections
- Phase 10: Consider service worker for offline mode
- Scale: MongoDB Atlas can scale to M10+ paid tiers as needed
