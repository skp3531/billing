const fs = require('fs');

let controller = fs.readFileSync('server/src/controllers/table.controller.ts', 'utf8');

controller = controller.replace(
  "const { name, capacity, status, outletId } = req.body;",
  "const { name, capacity, status, outletId, floorPlan, shape, positionX, positionY, currentOrderId } = req.body;"
);

controller = controller.replace(
  "{ name, capacity, status, outletId },",
  "{ name, capacity, status, outletId, floorPlan, shape, positionX, positionY, currentOrderId },"
);

fs.writeFileSync('server/src/controllers/table.controller.ts', controller);

let controller2 = fs.readFileSync('server/src/controllers/table.controller.ts', 'utf8');
controller2 = controller2.replace(
  "const { name, capacity, outletId } = req.body;",
  "const { name, capacity, outletId, floorPlan, shape, positionX, positionY } = req.body;"
);
controller2 = controller2.replace(
  "const table = new Table({\n      name,\n      capacity,\n      organizationId,\n      outletId,\n    });",
  "const table = new Table({\n      name,\n      capacity,\n      organizationId,\n      outletId,\n      floorPlan,\n      shape,\n      positionX,\n      positionY\n    });"
);
fs.writeFileSync('server/src/controllers/table.controller.ts', controller2);
