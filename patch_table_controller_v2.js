const fs = require('fs');
let controller = fs.readFileSync('server/src/controllers/table.controller.ts', 'utf8');

// Add import for Order to calculate KPIs
if (!controller.includes("import Order from '../models/Order';")) {
  controller = controller.replace(
    "import Table from '../models/Table';",
    "import Table from '../models/Table';\nimport Order from '../models/Order';\nimport Reservation from '../models/Reservation';"
  );
}

// Add getTableDashboard
const getTableDashboardFn = `
export const getTableDashboard = async (req: Request, res: Response) => {
  try {
    const organizationId = req.user?.organizationId;
    const { outletId } = req.query;

    const query: any = { organizationId };
    if (outletId) query.outletId = outletId;

    const tables = await Table.find(query);
    const totalTables = tables.length;
    const availableTables = tables.filter(t => t.status === 'AVAILABLE').length;
    const occupiedTables = tables.filter(t => t.status === 'OCCUPIED').length;
    const reservedTables = tables.filter(t => t.status === 'RESERVED').length;
    const cleaningTables = tables.filter(t => t.status === 'CLEANING').length;
    
    const occupancyPercentage = totalTables > 0 ? ((occupiedTables / totalTables) * 100).toFixed(1) : 0;

    // Revenue & Guests for Today
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const orderQuery: any = { 
      organizationId, 
      createdAt: { $gte: today },
      orderType: 'DINE_IN'
    };
    if (outletId) orderQuery.outletId = outletId;

    const todayOrders = await Order.find(orderQuery);
    
    const guestsSeatedToday = todayOrders.length * 2; // Approximating guests if not explicitly captured per order yet
    const tableRevenueToday = todayOrders.reduce((sum, order) => sum + (order.grandTotal || 0), 0);

    return res.status(200).json({
      data: {
        totalTables,
        availableTables,
        occupiedTables,
        reservedTables,
        cleaningTables,
        occupancyPercentage,
        guestsSeatedToday,
        tableRevenueToday
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};
`;

controller = controller + '\n' + getTableDashboardFn;

// Patch updateTable to include new fields
controller = controller.replace(
  "floorPlan, shape, positionX, positionY, currentOrderId } = req.body;",
  "floorPlan, shape, positionX, positionY, currentOrderId, rotation, width, height, assignedWaiterId, guestsSeated, linkedOrderIds } = req.body;"
);

controller = controller.replace(
  "floorPlan, shape, positionX, positionY, currentOrderId },",
  "floorPlan, shape, positionX, positionY, currentOrderId, rotation, width, height, assignedWaiterId, guestsSeated, linkedOrderIds },"
);

// Patch createTable to include new fields
controller = controller.replace(
  "const { name, capacity, outletId, floorPlan, shape, positionX, positionY } = req.body;",
  "const { name, capacity, outletId, floorPlan, shape, positionX, positionY, rotation, width, height } = req.body;"
);

controller = controller.replace(
  "positionX,\n      positionY",
  "positionX,\n      positionY,\n      rotation,\n      width,\n      height"
);

fs.writeFileSync('server/src/controllers/table.controller.ts', controller);
