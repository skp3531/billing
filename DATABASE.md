# DATABASE.md — Database Schema Reference

## Overview

- **Database**: MongoDB Atlas
- **ODM**: Mongoose v8
- **Strategy**: Single cluster, multi-tenant by `organizationId`

---

## Collections

### organizations

```typescript
{
  _id: ObjectId,                    // Auto-generated
  name: String,                     // Required, "Shake Sphere"
  logo: String,                     // Optional, URL to logo image
  phone: String,                    // Required
  email: String,                    // Required, unique, indexed
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  gstin: String,                    // Optional, 15-char GST number
  active: Boolean,                  // Default: true
  createdAt: Date,                  // Auto by timestamps
  updatedAt: Date                   // Auto by timestamps
}
```

**Indexes**: `email` (unique)

---

### outlets

```typescript
{
  _id: ObjectId,
  organizationId: ObjectId,         // ref: Organization, indexed
  name: String,                     // Required, "Main Outlet"
  code: String,                     // Short code, e.g. "MAIN", "BHB"
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  phone: String,
  gstin: String,                    // Outlet-specific GSTIN if different
  invoicePrefix: String,            // e.g. "SS", "CT", max 5 chars
  active: Boolean,                  // Default: true
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**: `{ organizationId: 1, code: 1 }` (compound unique)

---

### roles

```typescript
{
  _id: ObjectId,
  organizationId: ObjectId,         // ref: Organization, indexed
  name: String,                     // "OWNER", "MANAGER", "CASHIER"...
  permissions: [String],            // Array of permission strings
  isSystem: Boolean,                // System roles cannot be deleted
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**: `{ organizationId: 1, name: 1 }` (compound unique)

**Permission values** (see API.md for complete list):
- `dashboard.view`, `pos.view`, `pos.create_order`, `pos.cancel_order`
- `pos.refund`, `pos.apply_discount`, `orders.view`, `orders.manage`
- `kitchen.view`, `menu.view`, `menu.manage`
- `inventory.view`, `inventory.manage`
- `purchases.view`, `purchases.manage`
- `suppliers.view`, `suppliers.manage`
- `customers.view`, `customers.manage`
- `loyalty.view`, `loyalty.manage`
- `discounts.view`, `discounts.manage`
- `expenses.view`, `expenses.manage`
- `cash.view`, `cash.manage`
- `staff.view`, `staff.manage`
- `reports.view`, `reports.export`
- `settings.view`, `settings.manage`
- `roles.view`, `roles.manage`
- `audit.view`

---

### users

```typescript
{
  _id: ObjectId,
  organizationId: ObjectId,         // ref: Organization, indexed
  outletIds: [ObjectId],            // ref: Outlet[], which outlets user can access
  name: String,                     // Required
  email: String,                    // Required, unique, indexed
  phone: String,                    // Optional
  passwordHash: String,             // bcrypt hash, select: false (never returned)
  roleId: ObjectId,                 // ref: Role, indexed
  active: Boolean,                  // Default: true (soft delete)
  lastLogin: Date,                  // Updated on each login
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**: 
- `email` (unique)
- `organizationId`
- `roleId`

**Security Note**: `passwordHash` field has `select: false` in Mongoose schema. It will never be returned in API responses unless explicitly selected.

---

### audit_logs

```typescript
{
  _id: ObjectId,
  organizationId: ObjectId,         // Required, indexed
  outletId: ObjectId,               // Optional
  userId: ObjectId,                 // Who performed the action
  userName: String,                 // Denormalized for display
  action: String,                   // e.g. "user.login", "user.created"
  entity: String,                   // e.g. "User", "Organization"
  entityId: ObjectId,               // ID of the affected document
  changes: Mixed,                   // { before: {...}, after: {...} }
  ipAddress: String,
  userAgent: String,
  createdAt: Date                   // Immutable (no updatedAt)
}
```

**Indexes**:
- `{ organizationId: 1, createdAt: -1 }` (for listing by org + recency)
- `{ userId: 1, createdAt: -1 }` (for user activity)

**Important**: Audit logs are IMMUTABLE. No update operations allowed on this collection.

---

## Audit Events (Phase 1)

| Action | Entity | Triggered By |
|--------|--------|-------------|
| user.login | User | Successful login |
| user.logout | User | Explicit logout |
| user.login_failed | User | Failed login attempt |
| user.created | User | Admin creates user |
| user.updated | User | Admin updates user |
| user.deactivated | User | Admin deactivates user |
| organization.updated | Organization | Settings change |
| outlet.created | Outlet | New outlet created |
| outlet.updated | Outlet | Outlet updated |
| role.created | Role | Custom role created |
| role.updated | Role | Role permissions changed |

---

## Index Strategy

| Collection | Index | Type | Reason |
|------------|-------|------|--------|
| organizations | email | unique | Login lookup |
| outlets | { organizationId, code } | compound unique | Tenant isolation + code uniqueness |
| roles | { organizationId, name } | compound unique | Tenant isolation + name uniqueness |
| users | email | unique | Login lookup |
| users | organizationId | regular | Tenant filtering |
| users | roleId | regular | Role queries |
| audit_logs | { organizationId, createdAt } | compound | Recent activity per org |
| audit_logs | { userId, createdAt } | compound | User activity history |

---

## Seed Data

Organization: **Shake Sphere**
```
email: owner@shakesphere.com
phone: +91 9876543210
address: 123 Main Street, Bhubaneswar, Odisha 751001
GSTIN: 21AAAAA0000A1Z5
```

Outlet: **Main Outlet**
```
code: MAIN
invoicePrefix: SS
```

Roles created with `isSystem: true`:
- OWNER (all permissions)
- MANAGER (ops permissions)
- CASHIER (POS + cash)
- WAITER (order taking)
- KITCHEN (kitchen + order view)
- INVENTORY_MANAGER (stock + purchasing)
- ACCOUNTANT (reports + expenses)

Users (dev only — change passwords in production):
- owner@shakesphere.com / Owner@123
- manager@shakesphere.com / Manager@123
- cashier@shakesphere.com / Cashier@123
- kitchen@shakesphere.com / Kitchen@123
