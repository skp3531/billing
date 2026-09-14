const fs = require('fs');
let content = fs.readFileSync('server/src/controllers/order.controller.ts', 'utf8');

content = content.replace(
  "metadata: { orderNumber: order.orderNumber, grandTotal: order.grandTotal, status: order.status }",
  "changes: { orderNumber: order.orderNumber, grandTotal: order.grandTotal, status: order.status }"
);

fs.writeFileSync('server/src/controllers/order.controller.ts', content);
