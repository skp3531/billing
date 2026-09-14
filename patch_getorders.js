const fs = require('fs');

// Patch Backend
let controller = fs.readFileSync('server/src/controllers/order.controller.ts', 'utf8');
controller = controller.replace(
  "const { outletId, status, filter, page = '1', limit = '50' } = req.query;",
  "const { outletId, status, filter, page = '1', limit = '50', startDate, endDate } = req.query;"
);

controller = controller.replace(
  "if (status) {\n    query.status = (status as string).toUpperCase();\n  }",
  `if (status) {
    query.status = (status as string).toUpperCase();
  }
  
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate as string),
      $lte: new Date(endDate as string)
    };
  }`
);
fs.writeFileSync('server/src/controllers/order.controller.ts', controller);

// Patch Frontend API
let api = fs.readFileSync('client/src/api/order.api.ts', 'utf8');
api = api.replace(
  "options: { filter?: 'active' | 'past', status?: string, page?: number, limit?: number } = {}",
  "options: { filter?: 'active' | 'past', status?: string, page?: number, limit?: number, startDate?: string, endDate?: string } = {}"
);
api = api.replace(
  "if (options.status) params.append('status', options.status);",
  "if (options.status) params.append('status', options.status);\n    if (options.startDate) params.append('startDate', options.startDate);\n    if (options.endDate) params.append('endDate', options.endDate);"
);
fs.writeFileSync('client/src/api/order.api.ts', api);

// Patch OrdersPage
let pos = fs.readFileSync('client/src/pages/orders/OrdersPage.tsx', 'utf8');
pos = pos.replace(
  "const data = await orderApi.getOrders(currentOutlet._id, startDate.toISOString(), endDate.toISOString());",
  "const data = await orderApi.getOrders(currentOutlet._id, { startDate: startDate.toISOString(), endDate: endDate.toISOString(), limit: 500 });"
);
pos = pos.replace(
  "setOrders(data);",
  "setOrders(data.data);"
);
fs.writeFileSync('client/src/pages/orders/OrdersPage.tsx', pos);

// Fix Drawer ReceiptRefund icon and undefined itemTotal
let drawer = fs.readFileSync('client/src/pages/orders/components/OrderDetailsDrawer.tsx', 'utf8');
drawer = drawer.replace("ReceiptRefund", "Receipt");
drawer = drawer.replace("item.itemTotal.toFixed", "(item.itemTotal || 0).toFixed");
fs.writeFileSync('client/src/pages/orders/components/OrderDetailsDrawer.tsx', drawer);
