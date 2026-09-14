const fs = require('fs');

let supplierRoutes = fs.readFileSync('server/src/routes/supplier.routes.ts', 'utf8');
supplierRoutes = supplierRoutes.replace("router.post('/', requirePermission(PERMISSIONS.SUPPLIERS_MANAGE), asyncHandler(createSupplier));", "router.post('/', requirePermission(PERMISSIONS.SUPPLIERS_MANAGE, PERMISSIONS.SUPPLIERS_CREATE), asyncHandler(createSupplier));");
supplierRoutes = supplierRoutes.replace("router.put('/:id', requirePermission(PERMISSIONS.SUPPLIERS_MANAGE), asyncHandler(updateSupplier));", "router.put('/:id', requirePermission(PERMISSIONS.SUPPLIERS_MANAGE, PERMISSIONS.SUPPLIERS_EDIT), asyncHandler(updateSupplier));");
supplierRoutes = supplierRoutes.replace("router.delete('/:id', requirePermission(PERMISSIONS.SUPPLIERS_MANAGE), asyncHandler(deleteSupplier));", "router.delete('/:id', requirePermission(PERMISSIONS.SUPPLIERS_MANAGE, PERMISSIONS.SUPPLIERS_DELETE), asyncHandler(deleteSupplier));");
fs.writeFileSync('server/src/routes/supplier.routes.ts', supplierRoutes);

let expenseRoutes = fs.readFileSync('server/src/routes/expense.routes.ts', 'utf8');
expenseRoutes = expenseRoutes.replace("router.post('/', requirePermission(PERMISSIONS.EXPENSES_MANAGE), asyncHandler(createExpense));", "router.post('/', requirePermission(PERMISSIONS.EXPENSES_MANAGE, PERMISSIONS.EXPENSES_CREATE), asyncHandler(createExpense));");
expenseRoutes = expenseRoutes.replace("router.put('/:id', requirePermission(PERMISSIONS.EXPENSES_MANAGE), asyncHandler(updateExpense));", "router.put('/:id', requirePermission(PERMISSIONS.EXPENSES_MANAGE, PERMISSIONS.EXPENSES_EDIT), asyncHandler(updateExpense));");
expenseRoutes = expenseRoutes.replace("router.delete('/:id', requirePermission(PERMISSIONS.EXPENSES_MANAGE), asyncHandler(deleteExpense));", "router.delete('/:id', requirePermission(PERMISSIONS.EXPENSES_MANAGE, PERMISSIONS.EXPENSES_DELETE), asyncHandler(deleteExpense));");
fs.writeFileSync('server/src/routes/expense.routes.ts', expenseRoutes);

let purchaseRoutes = fs.readFileSync('server/src/routes/purchase.routes.ts', 'utf8');
purchaseRoutes = purchaseRoutes.replace("router.post('/', requirePermission(PERMISSIONS.PURCHASES_MANAGE), asyncHandler(createPurchase));", "router.post('/', requirePermission(PERMISSIONS.PURCHASES_MANAGE, PERMISSIONS.PURCHASES_CREATE), asyncHandler(createPurchase));");
purchaseRoutes = purchaseRoutes.replace("router.patch('/:id/status', requirePermission(PERMISSIONS.PURCHASES_MANAGE), asyncHandler(updatePurchaseStatus));", "router.patch('/:id/status', requirePermission(PERMISSIONS.PURCHASES_MANAGE, PERMISSIONS.PURCHASES_EDIT), asyncHandler(updatePurchaseStatus));");
fs.writeFileSync('server/src/routes/purchase.routes.ts', purchaseRoutes);

let orderRoutes = fs.readFileSync('server/src/routes/order.routes.ts', 'utf8');
// POS_MANAGE for createOrder
orderRoutes = orderRoutes.replace("router.post('/', requirePermission(PERMISSIONS.POS_MANAGE), asyncHandler(createOrder));", "router.post('/', requirePermission(PERMISSIONS.POS_MANAGE, PERMISSIONS.POS_CREATE_ORDER), asyncHandler(createOrder));");
// ORDERS_MANAGE for update
orderRoutes = orderRoutes.replace("router.patch('/:id/status', requirePermission(PERMISSIONS.ORDERS_MANAGE), asyncHandler(updateOrderStatus));", "router.patch('/:id/status', requirePermission(PERMISSIONS.ORDERS_MANAGE, PERMISSIONS.ORDERS_EDIT), asyncHandler(updateOrderStatus));");
orderRoutes = orderRoutes.replace("router.patch('/:id/items/:itemId/status', requirePermission(PERMISSIONS.ORDERS_MANAGE), asyncHandler(updateOrderItemStatus));", "router.patch('/:id/items/:itemId/status', requirePermission(PERMISSIONS.ORDERS_MANAGE, PERMISSIONS.ORDERS_EDIT), asyncHandler(updateOrderItemStatus));");
orderRoutes = orderRoutes.replace("router.delete('/:id', requirePermission(PERMISSIONS.ORDERS_MANAGE), asyncHandler(deleteOrder));", "router.delete('/:id', requirePermission(PERMISSIONS.ORDERS_MANAGE, PERMISSIONS.ORDERS_DELETE), asyncHandler(deleteOrder));");
fs.writeFileSync('server/src/routes/order.routes.ts', orderRoutes);

