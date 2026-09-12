# ARCHITECTURE.md — System Architecture

## Overview

RestoPOS follows a **3-tier architecture**: Frontend (React SPA) → Backend (REST API) → Database (MongoDB).

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                       │
│   React 18 + TypeScript + Vite + Tailwind CSS   │
│   Port: 5173                                     │
└─────────────────────────┬───────────────────────┘
                          │ HTTP/REST (JSON)
                          │ Axios (with JWT Bearer + cookie)
┌─────────────────────────▼───────────────────────┐
│                   BACKEND                        │
│   Node.js + Express + TypeScript                 │
│   Port: 5000                                     │
│                                                  │
│  ┌──────────┐  ┌────────────┐  ┌─────────────┐  │
│  │  Routes  │→ │Controllers │→ │  Services   │  │
│  └──────────┘  └────────────┘  └──────┬──────┘  │
│                                        │         │
│  ┌─────────────────────────────────────▼──────┐  │
│  │          Mongoose ODM                       │  │
│  └─────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────┘
                          │ MongoDB Wire Protocol
┌─────────────────────────▼───────────────────────┐
│                  DATABASE                        │
│   MongoDB Atlas (Cloud)                          │
│   Collections: organizations, outlets, users,    │
│                roles, audit_logs                 │
└─────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Directory Structure
```
client/src/
├── api/           — Axios instance + API function modules
├── components/
│   ├── ui/        — Primitive UI components (Button, Input, Modal...)
│   ├── layout/    — App shell (Sidebar, TopBar, OutletSelector)
│   └── guards/    — Route protection (ProtectedRoute, PermissionGuard)
├── hooks/         — Custom React hooks
├── pages/         — Route-level page components
├── store/         — Zustand global state stores
├── types/         — TypeScript interfaces
└── utils/         — Pure helper functions
```

### State Management (Zustand)
```
authStore: {
  accessToken,        # In memory only (not persisted)
  user,               # Persisted in localStorage
  organization,       # Persisted
  outlets,            # Persisted
  currentOutlet,      # Persisted
}

appStore: {
  sidebarCollapsed,   # UI state
  isLoading,          # Global loading
}
```

### Routing Architecture
```
Public:
  /login              → LoginPage
  /unauthorized       → UnauthorizedPage
  /404                → NotFoundPage

Protected (requires valid JWT):
  /                   → redirect to /dashboard
  /setup              → SetupWizard (owner only, first time)
  /dashboard          → DashboardPage
  /pos                → ComingSoonPage
  /orders             → ComingSoonPage
  /tables             → ComingSoonPage
  /kitchen            → ComingSoonPage
  /menu               → ComingSoonPage
  /inventory          → ComingSoonPage
  /purchases          → ComingSoonPage
  /suppliers          → ComingSoonPage
  /customers          → ComingSoonPage
  /staff              → UsersPage (requires staff.view)
  /expenses           → ComingSoonPage
  /reports            → ComingSoonPage
  /settings           → SettingsPage
  /settings/outlets   → OutletsPage
  /settings/roles     → RolesPage
```

---

## Backend Architecture

### Directory Structure
```
server/src/
├── config/
│   ├── db.ts          — MongoDB connection with retry
│   └── env.ts         — Environment variables validation
├── models/            — Mongoose schemas and models
├── routes/            — Express routers
├── controllers/       — Request handlers (thin layer)
├── services/          — Business logic
├── middleware/
│   ├── authenticate.ts  — JWT verification
│   ├── authorize.ts     — Permission checking
│   ├── errorHandler.ts  — Global error handler
│   └── asyncHandler.ts  — Async wrapper
├── validators/        — express-validator rule sets
├── utils/
│   ├── jwt.ts         — Token sign/verify
│   ├── permissions.ts — Permission constants + role defaults
│   ├── apiResponse.ts — Standardized response format
│   └── auditLog.ts    — Audit logging helper
└── scripts/
    └── seed.ts        — Development seed data
```

### Request Lifecycle
```
Request
  ↓
helmet (security headers)
  ↓
cors (allowed origins)
  ↓
morgan (logging)
  ↓
express.json() (body parsing)
  ↓
cookieParser() (cookie parsing)
  ↓
Router → Controller
  ↓
authenticate middleware (JWT verify → req.user)
  ↓
authorize middleware (permission check)
  ↓
validators (input validation)
  ↓
asyncHandler → service call
  ↓
Response (standardized JSON)
  ↓
errorHandler (catch any thrown errors)
```

### API Response Format
```json
// Success
{
  "success": true,
  "message": "User created successfully",
  "data": { ... }
}

// Error
{
  "success": false,
  "message": "Validation failed",
  "errors": { "email": "Invalid email address" }
}

// Paginated
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

---

## Authentication Architecture

### Token Strategy
| Token | Storage | Expiry | Purpose |
|-------|---------|--------|---------|
| Access Token (JWT) | Memory (Zustand) | 15 min | API authentication |
| Refresh Token (JWT) | HTTP-only cookie | 7 days | Token renewal |

### Security Decisions
- **XSS Protection**: Access token in JS memory, not localStorage. If page is XSS'd, attacker cannot steal the long-lived refresh token (it's HTTP-only).
- **CSRF Protection**: Refresh token cookie uses SameSite=Strict. Access token is in memory, so CSRF cannot use it.
- **Tenant Isolation**: organizationId ALWAYS from `req.user` (JWT), never from request body. Client cannot forge org access.
- **Audit Trail**: Every auth event (login, logout, refresh) is logged to audit_logs collection.

---

## Multi-tenancy Architecture

```
Organization A (Shake Sphere)
├── Outlet 1: Main Outlet
├── Outlet 2: Berhampur Outlet
└── Users: [Owner, Manager, Cashier]

Organization B (Crispy Town)
├── Outlet 1: Main Outlet
└── Users: [Owner, Cashier]
```

**Isolation Rules:**
1. Every query filters by `organizationId: req.user.organizationId`
2. Every outlet access checks `outletIds` in user's JWT payload
3. System roles are created per-organization (not globally shared)
4. Audit logs are scoped per organization

---

## Security Architecture

### Layers of Defense
1. **helmet** — HTTP security headers (XSS, clickjacking, MIME sniffing)
2. **cors** — Only allow configured CLIENT_URL origin
3. **express-validator** — Sanitize and validate all inputs
4. **JWT authentication** — All non-public routes require valid JWT
5. **Permission authorization** — All sensitive routes check specific permissions
6. **Tenant isolation** — All queries scoped to organizationId from JWT
7. **bcrypt hashing** — Passwords never stored plaintext (rounds=12)
8. **HTTP-only cookies** — Refresh token never accessible via JavaScript
9. **Audit logging** — Immutable log of all sensitive operations

### Never Do (enforced in code)
- Never store plain text passwords
- Never return `passwordHash` in any API response
- Never trust `organizationId` or `outletId` from request body
- Never expose stack traces in production
- Never put secrets in client code
