const fs = require('fs');

let content = fs.readFileSync('client/src/pages/roles/RolesPage.tsx', 'utf8');

const oldArray = `const ALL_PERMISSIONS = [
  { group: 'Dashboard', perms: ['dashboard.view'] },
  { group: 'POS', perms: ['pos.view', 'pos.create_order', 'pos.cancel_order', 'pos.refund', 'pos.apply_discount'] },
  { group: 'Orders', perms: ['orders.view', 'orders.manage'] },
  { group: 'Kitchen', perms: ['kitchen.view'] },
  { group: 'Menu', perms: ['menu.view', 'menu.manage'] },
  { group: 'Inventory', perms: ['inventory.view', 'inventory.manage'] },
  { group: 'Purchases', perms: ['purchases.view', 'purchases.manage'] },
  { group: 'Suppliers', perms: ['suppliers.view', 'suppliers.manage'] },
  { group: 'Customers', perms: ['customers.view', 'customers.manage'] },
  { group: 'Loyalty', perms: ['loyalty.view', 'loyalty.manage'] },
  { group: 'Discounts', perms: ['discounts.view', 'discounts.manage'] },
  { group: 'Expenses', perms: ['expenses.view', 'expenses.manage'] },
  { group: 'Cash', perms: ['cash.view', 'cash.manage'] },
  { group: 'Staff', perms: ['staff.view', 'staff.manage'] },
  { group: 'Reports', perms: ['reports.view', 'reports.export'] },
  { group: 'Settings', perms: ['settings.view', 'settings.manage'] },
  { group: 'Roles', perms: ['roles.view', 'roles.manage'] },
  { group: 'Audit', perms: ['audit.view'] },
];`;

const newArray = `const ALL_PERMISSIONS = [
  { group: 'Dashboard', perms: ['dashboard.view'] },
  { group: 'POS', perms: ['pos.view', 'pos.create', 'pos.edit', 'pos.delete', 'pos.manage', 'pos.create_order', 'pos.cancel_order', 'pos.refund', 'pos.apply_discount'] },
  { group: 'Orders', perms: ['orders.view', 'orders.create', 'orders.edit', 'orders.delete', 'orders.manage'] },
  { group: 'Kitchen', perms: ['kitchen.view'] },
  { group: 'Menu', perms: ['menu.view', 'menu.create', 'menu.edit', 'menu.delete', 'menu.manage'] },
  { group: 'Inventory', perms: ['inventory.view', 'inventory.create', 'inventory.edit', 'inventory.delete', 'inventory.manage'] },
  { group: 'Purchases', perms: ['purchases.view', 'purchases.create', 'purchases.edit', 'purchases.delete', 'purchases.manage'] },
  { group: 'Suppliers', perms: ['suppliers.view', 'suppliers.create', 'suppliers.edit', 'suppliers.delete', 'suppliers.manage'] },
  { group: 'Customers', perms: ['customers.view', 'customers.create', 'customers.edit', 'customers.delete', 'customers.manage'] },
  { group: 'Loyalty', perms: ['loyalty.view', 'loyalty.create', 'loyalty.edit', 'loyalty.delete', 'loyalty.manage'] },
  { group: 'Discounts', perms: ['discounts.view', 'discounts.create', 'discounts.edit', 'discounts.delete', 'discounts.manage'] },
  { group: 'Expenses', perms: ['expenses.view', 'expenses.create', 'expenses.edit', 'expenses.delete', 'expenses.manage'] },
  { group: 'Cash', perms: ['cash.view', 'cash.create', 'cash.edit', 'cash.delete', 'cash.manage'] },
  { group: 'Staff', perms: ['staff.view', 'staff.create', 'staff.edit', 'staff.delete', 'staff.manage'] },
  { group: 'Reports', perms: ['reports.view', 'reports.export'] },
  { group: 'Settings', perms: ['settings.view', 'settings.create', 'settings.edit', 'settings.delete', 'settings.manage'] },
  { group: 'Roles', perms: ['roles.view', 'roles.create', 'roles.edit', 'roles.delete', 'roles.manage'] },
  { group: 'Audit', perms: ['audit.view'] },
];`;

content = content.replace(oldArray, newArray);
fs.writeFileSync('client/src/pages/roles/RolesPage.tsx', content);
