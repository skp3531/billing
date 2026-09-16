const fs = require('fs');

// Fix Table Controller
let controller = fs.readFileSync('server/src/controllers/table.controller.ts', 'utf8');

controller = controller.replace(
  "const { name, capacity, status, outletId, floorPlan, shape, positionX, positionY, currentOrderId } = req.body;",
  "const { name, capacity, status, outletId, floorPlan, shape, positionX, positionY, currentOrderId, rotation, width, height, assignedWaiterId, guestsSeated, linkedOrderIds } = req.body;"
);

fs.writeFileSync('server/src/controllers/table.controller.ts', controller);

// Fix Table Routes
let routes = fs.readFileSync('server/src/routes/table.routes.ts', 'utf8');
routes = routes.replace(
  "import { requireAuth, requirePermission } from '../middleware/auth';",
  "import { requireAuth, requirePermission } from '../middleware/auth';\nimport { PERMISSIONS } from '../types/permissions';"
);
fs.writeFileSync('server/src/routes/table.routes.ts', routes);

