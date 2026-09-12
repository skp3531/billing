# API.md — REST API Reference

## Base URL
```
Development: http://localhost:5000/api
```

## Authentication

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

Refresh token is sent automatically via HTTP-only cookie.

---

## Auth Endpoints

### POST /api/auth/login
Login with email and password.

**Request:**
```json
{
  "email": "owner@shakesphere.com",
  "password": "Owner@123"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "user": {
      "_id": "...",
      "name": "Sanjay Kumar",
      "email": "owner@shakesphere.com",
      "organizationId": "...",
      "roleName": "OWNER",
      "permissions": ["dashboard.view", "pos.view", "..."],
      "outletIds": ["..."]
    },
    "organization": {
      "_id": "...",
      "name": "Shake Sphere",
      "logo": null,
      "phone": "+91 9876543210"
    },
    "outlets": [...],
    "currentOutlet": { "_id": "...", "name": "Main Outlet", "code": "MAIN" }
  }
}
```

**Response 401 (invalid credentials):**
```json
{ "success": false, "message": "Invalid email or password" }
```

---

### POST /api/auth/logout
Logout and clear refresh cookie.

**Response 200:**
```json
{ "success": true, "message": "Logged out successfully" }
```

---

### POST /api/auth/refresh
Get a new access token using the HTTP-only refresh cookie.

**Response 200:**
```json
{
  "success": true,
  "data": { "accessToken": "eyJhbGci..." }
}
```

---

### GET /api/auth/me
Get current authenticated user's full profile.

**Protected**: Yes

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "organization": { ... },
    "outlets": [...],
    "currentOutlet": { ... }
  }
}
```

---

## Organization Endpoints

### GET /api/organizations/me
Get current user's organization details.

**Protected**: Yes, `settings.view`

### PUT /api/organizations/me
Update organization settings.

**Protected**: Yes, `settings.manage`

**Request:**
```json
{
  "name": "Shake Sphere",
  "phone": "+91 9876543210",
  "email": "contact@shakesphere.com",
  "address": {
    "street": "123 Main Street",
    "city": "Bhubaneswar",
    "state": "Odisha",
    "pincode": "751001"
  },
  "gstin": "21AAAAA0000A1Z5"
}
```

### POST /api/organizations/setup
First-time setup to create organization + outlet.

**Protected**: Yes (used during initial setup flow)

---

## Outlet Endpoints

### GET /api/outlets
List all outlets for current organization.

**Protected**: Yes

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Main Outlet",
      "code": "MAIN",
      "invoicePrefix": "SS",
      "active": true
    }
  ]
}
```

### GET /api/outlets/:id
Get a single outlet by ID.

**Protected**: Yes

### POST /api/outlets
Create a new outlet.

**Protected**: Yes, `settings.manage`

**Request:**
```json
{
  "name": "Berhampur Outlet",
  "code": "BHB",
  "invoicePrefix": "SS-B",
  "phone": "+91 9876543211",
  "address": { ... }
}
```

### PUT /api/outlets/:id
Update an outlet.

**Protected**: Yes, `settings.manage`

---

## User Endpoints

### GET /api/users
List all users in current organization.

**Protected**: Yes, `staff.view`

**Query params:** `?page=1&limit=20&active=true&roleId=...`

### GET /api/users/:id
Get a single user.

**Protected**: Yes, `staff.view` (or own profile)

### POST /api/users
Create a new user.

**Protected**: Yes, `staff.manage`

**Request:**
```json
{
  "name": "New Cashier",
  "email": "cashier2@shakesphere.com",
  "phone": "+91 9876543212",
  "password": "Cashier@456",
  "roleId": "...",
  "outletIds": ["..."]
}
```

### PUT /api/users/:id
Update a user.

**Protected**: Yes, `staff.manage`

### DELETE /api/users/:id
Deactivate a user (soft delete, sets `active: false`).

**Protected**: Yes, `staff.manage`

---

## Role Endpoints

### GET /api/roles
List all roles for current organization.

**Protected**: Yes, `roles.view`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "OWNER",
      "permissions": ["dashboard.view", "..."],
      "isSystem": true
    }
  ]
}
```

### GET /api/roles/:id
Get a single role with permissions.

**Protected**: Yes, `roles.view`

### POST /api/roles
Create a custom role.

**Protected**: Yes, `roles.manage`

### PUT /api/roles/:id
Update a role's permissions.

**Protected**: Yes, `roles.manage`  
**Note**: Cannot modify system roles (`isSystem: true`).

---

## Permissions Reference

```
dashboard.view        — View dashboard
pos.view              — Access POS screen
pos.create_order      — Create new order/bill
pos.cancel_order      — Cancel an order
pos.refund            — Issue refund
pos.apply_discount    — Apply discount on bill
orders.view           — View orders list
orders.manage         — Manage/edit orders
kitchen.view          — View kitchen display
menu.view             — View menu items
menu.manage           — Create/edit/delete menu items
inventory.view        — View inventory
inventory.manage      — Adjust stock, manage items
purchases.view        — View purchase orders
purchases.manage      — Create/edit purchase orders
suppliers.view        — View suppliers
suppliers.manage      — Manage supplier records
customers.view        — View customer list
customers.manage      — Manage customer records
loyalty.view          — View loyalty program
loyalty.manage        — Manage loyalty settings
discounts.view        — View discount list
discounts.manage      — Create/edit discounts
expenses.view         — View expenses
expenses.manage       — Record/edit expenses
cash.view             — View cash register
cash.manage           — Open/close cash session
staff.view            — View staff list
staff.manage          — Add/edit/deactivate staff
reports.view          — View reports
reports.export        — Export reports
settings.view         — View settings
settings.manage       — Change settings
roles.view            — View roles and permissions
roles.manage          — Create/edit roles
audit.view            — View audit logs
```

---

## Error Codes

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate email, etc.) |
| 422 | Unprocessable Entity (Mongoose validation) |
| 500 | Internal Server Error |
