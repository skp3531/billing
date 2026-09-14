const fs = require('fs');
let content = fs.readFileSync('server/src/controllers/order.controller.ts', 'utf8');

content = content.replace(
  "entityId: order._id as string,",
  "entityId: order._id.toString(),"
);

fs.writeFileSync('server/src/controllers/order.controller.ts', content);
