const fs = require('fs');

let controller = fs.readFileSync('server/src/controllers/table.controller.ts', 'utf8');

controller = controller.replace(
  "const { name, capacity, status, outletId } = req.body;",
  "const { name, capacity, status, outletId, floorPlan, shape, positionX, positionY, currentOrderId } = req.body;"
);

fs.writeFileSync('server/src/controllers/table.controller.ts', controller);
