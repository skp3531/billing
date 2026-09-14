const fs = require('fs');

const replacements = [
  { file: 'user.routes.ts', 
    regex: /STAFF_MANAGE/g, 
    repl: (match, index, full) => full.includes("post('/')") ? "STAFF_MANAGE, PERMISSIONS.STAFF_CREATE" : (full.includes("put") ? "STAFF_MANAGE, PERMISSIONS.STAFF_EDIT" : "STAFF_MANAGE, PERMISSIONS.STAFF_DELETE") },
  { file: 'menuItem.routes.ts',
    regex: /MENU_MANAGE/g,
    repl: (match, index, full) => full.includes("post('/')") ? "MENU_MANAGE, PERMISSIONS.MENU_CREATE" : (full.includes("put") ? "MENU_MANAGE, PERMISSIONS.MENU_EDIT" : (full.includes("delete") ? "MENU_MANAGE, PERMISSIONS.MENU_DELETE" : "MENU_MANAGE")) },
  { file: 'category.routes.ts',
    regex: /MENU_MANAGE/g,
    repl: (match, index, full) => full.includes("post('/')") ? "MENU_MANAGE, PERMISSIONS.MENU_CREATE" : (full.includes("put") ? "MENU_MANAGE, PERMISSIONS.MENU_EDIT" : (full.includes("delete") ? "MENU_MANAGE, PERMISSIONS.MENU_DELETE" : "MENU_MANAGE")) },
  { file: 'rawMaterial.routes.ts',
    regex: /INVENTORY_MANAGE/g,
    repl: (match, index, full) => full.includes("post('/')") ? "INVENTORY_MANAGE, PERMISSIONS.INVENTORY_CREATE" : (full.includes("put") ? "INVENTORY_MANAGE, PERMISSIONS.INVENTORY_EDIT" : (full.includes("delete") ? "INVENTORY_MANAGE, PERMISSIONS.INVENTORY_DELETE" : "INVENTORY_MANAGE")) },
  { file: 'customer.routes.ts',
    regex: /CUSTOMERS_MANAGE/g,
    repl: (match, index, full) => full.includes("post('/')") ? "CUSTOMERS_MANAGE, PERMISSIONS.CUSTOMERS_CREATE" : (full.includes("put") ? "CUSTOMERS_MANAGE, PERMISSIONS.CUSTOMERS_EDIT" : (full.includes("delete") ? "CUSTOMERS_MANAGE, PERMISSIONS.CUSTOMERS_DELETE" : "CUSTOMERS_MANAGE")) },
  { file: 'supplier.routes.ts',
    regex: /SUPPLIERS_MANAGE/g,
    repl: (match, index, full) => full.includes("post('/')") ? "SUPPLIERS_MANAGE, PERMISSIONS.SUPPLIERS_CREATE" : (full.includes("put") ? "SUPPLIERS_MANAGE, PERMISSIONS.SUPPLIERS_EDIT" : (full.includes("delete") ? "SUPPLIERS_MANAGE, PERMISSIONS.SUPPLIERS_DELETE" : "SUPPLIERS_MANAGE")) },
  { file: 'expense.routes.ts',
    regex: /EXPENSES_MANAGE/g,
    repl: (match, index, full) => full.includes("post('/')") ? "EXPENSES_MANAGE, PERMISSIONS.EXPENSES_CREATE" : (full.includes("put") ? "EXPENSES_MANAGE, PERMISSIONS.EXPENSES_EDIT" : (full.includes("delete") ? "EXPENSES_MANAGE, PERMISSIONS.EXPENSES_DELETE" : "EXPENSES_MANAGE")) },
  { file: 'purchase.routes.ts',
    regex: /PURCHASES_MANAGE/g,
    repl: (match, index, full) => full.includes("post('/')") ? "PURCHASES_MANAGE, PERMISSIONS.PURCHASES_CREATE" : (full.includes("patch") ? "PURCHASES_MANAGE, PERMISSIONS.PURCHASES_EDIT" : "PURCHASES_MANAGE") },
  { file: 'order.routes.ts',
    regex: /ORDERS_MANAGE/g,
    repl: (match, index, full) => full.includes("post('/')") ? "ORDERS_MANAGE, PERMISSIONS.ORDERS_CREATE" : (full.includes("patch") ? "ORDERS_MANAGE, PERMISSIONS.ORDERS_EDIT" : (full.includes("delete") ? "ORDERS_MANAGE, PERMISSIONS.ORDERS_DELETE" : "ORDERS_MANAGE")) }
];

// Instead of complex logic, I'll just write explicitly what needs replacing line by line.

let menuRoutes = fs.readFileSync('server/src/routes/menuItem.routes.ts', 'utf8');
menuRoutes = menuRoutes.replace("router.post('/', requirePermission(PERMISSIONS.MENU_MANAGE), asyncHandler(createMenuItem));", "router.post('/', requirePermission(PERMISSIONS.MENU_MANAGE, PERMISSIONS.MENU_CREATE), asyncHandler(createMenuItem));");
menuRoutes = menuRoutes.replace("router.put('/:id', requirePermission(PERMISSIONS.MENU_MANAGE), asyncHandler(updateMenuItem));", "router.put('/:id', requirePermission(PERMISSIONS.MENU_MANAGE, PERMISSIONS.MENU_EDIT), asyncHandler(updateMenuItem));");
menuRoutes = menuRoutes.replace("router.delete('/:id', requirePermission(PERMISSIONS.MENU_MANAGE), asyncHandler(deleteMenuItem));", "router.delete('/:id', requirePermission(PERMISSIONS.MENU_MANAGE, PERMISSIONS.MENU_DELETE), asyncHandler(deleteMenuItem));");
fs.writeFileSync('server/src/routes/menuItem.routes.ts', menuRoutes);

let catRoutes = fs.readFileSync('server/src/routes/category.routes.ts', 'utf8');
catRoutes = catRoutes.replace("router.post('/', requirePermission(PERMISSIONS.MENU_MANAGE), asyncHandler(createCategory));", "router.post('/', requirePermission(PERMISSIONS.MENU_MANAGE, PERMISSIONS.MENU_CREATE), asyncHandler(createCategory));");
catRoutes = catRoutes.replace("router.put('/:id', requirePermission(PERMISSIONS.MENU_MANAGE), asyncHandler(updateCategory));", "router.put('/:id', requirePermission(PERMISSIONS.MENU_MANAGE, PERMISSIONS.MENU_EDIT), asyncHandler(updateCategory));");
catRoutes = catRoutes.replace("router.delete('/:id', requirePermission(PERMISSIONS.MENU_MANAGE), asyncHandler(deleteCategory));", "router.delete('/:id', requirePermission(PERMISSIONS.MENU_MANAGE, PERMISSIONS.MENU_DELETE), asyncHandler(deleteCategory));");
fs.writeFileSync('server/src/routes/category.routes.ts', catRoutes);

// RawMaterial
let rawRoutes = fs.readFileSync('server/src/routes/rawMaterial.routes.ts', 'utf8');
rawRoutes = rawRoutes.replace("router.post('/', requirePermission(PERMISSIONS.INVENTORY_MANAGE), asyncHandler(createRawMaterial));", "router.post('/', requirePermission(PERMISSIONS.INVENTORY_MANAGE, PERMISSIONS.INVENTORY_CREATE), asyncHandler(createRawMaterial));");
rawRoutes = rawRoutes.replace("router.put('/:id', requirePermission(PERMISSIONS.INVENTORY_MANAGE), asyncHandler(updateRawMaterial));", "router.put('/:id', requirePermission(PERMISSIONS.INVENTORY_MANAGE, PERMISSIONS.INVENTORY_EDIT), asyncHandler(updateRawMaterial));");
rawRoutes = rawRoutes.replace("router.delete('/:id', requirePermission(PERMISSIONS.INVENTORY_MANAGE), asyncHandler(deleteRawMaterial));", "router.delete('/:id', requirePermission(PERMISSIONS.INVENTORY_MANAGE, PERMISSIONS.INVENTORY_DELETE), asyncHandler(deleteRawMaterial));");
fs.writeFileSync('server/src/routes/rawMaterial.routes.ts', rawRoutes);

// Customer
let custRoutes = fs.readFileSync('server/src/routes/customer.routes.ts', 'utf8');
custRoutes = custRoutes.replace("router.post('/', requirePermission(PERMISSIONS.CUSTOMERS_MANAGE), asyncHandler(createCustomer));", "router.post('/', requirePermission(PERMISSIONS.CUSTOMERS_MANAGE, PERMISSIONS.CUSTOMERS_CREATE), asyncHandler(createCustomer));");
custRoutes = custRoutes.replace("router.put('/:id', requirePermission(PERMISSIONS.CUSTOMERS_MANAGE), asyncHandler(updateCustomer));", "router.put('/:id', requirePermission(PERMISSIONS.CUSTOMERS_MANAGE, PERMISSIONS.CUSTOMERS_EDIT), asyncHandler(updateCustomer));");
custRoutes = custRoutes.replace("router.delete('/:id', requirePermission(PERMISSIONS.CUSTOMERS_MANAGE), asyncHandler(deleteCustomer));", "router.delete('/:id', requirePermission(PERMISSIONS.CUSTOMERS_MANAGE, PERMISSIONS.CUSTOMERS_DELETE), asyncHandler(deleteCustomer));");
fs.writeFileSync('server/src/routes/customer.routes.ts', custRoutes);

// User/Staff
let userRoutes = fs.readFileSync('server/src/routes/user.routes.ts', 'utf8');
userRoutes = userRoutes.replace("router.post('/', requirePermission(PERMISSIONS.STAFF_MANAGE), asyncHandler(createUser));", "router.post('/', requirePermission(PERMISSIONS.STAFF_MANAGE, PERMISSIONS.STAFF_CREATE), asyncHandler(createUser));");
userRoutes = userRoutes.replace("router.put('/:id', requirePermission(PERMISSIONS.STAFF_MANAGE), asyncHandler(updateUser));", "router.put('/:id', requirePermission(PERMISSIONS.STAFF_MANAGE, PERMISSIONS.STAFF_EDIT), asyncHandler(updateUser));");
userRoutes = userRoutes.replace("router.delete('/:id', requirePermission(PERMISSIONS.STAFF_MANAGE), asyncHandler(deleteUser));", "router.delete('/:id', requirePermission(PERMISSIONS.STAFF_MANAGE, PERMISSIONS.STAFF_DELETE), asyncHandler(deleteUser));");
fs.writeFileSync('server/src/routes/user.routes.ts', userRoutes);

