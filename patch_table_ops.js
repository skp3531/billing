const fs = require('fs');
let controller = fs.readFileSync('server/src/controllers/table.controller.ts', 'utf8');

const tableOps = `
export const transferTable = async (req: Request, res: Response) => {
  try {
    const { fromTableId, toTableId } = req.body;
    const organizationId = req.user?.organizationId;

    const fromTable = await Table.findOne({ _id: fromTableId, organizationId });
    const toTable = await Table.findOne({ _id: toTableId, organizationId });

    if (!fromTable || !toTable) return res.status(404).json({ message: 'Table not found' });
    if (!fromTable.currentOrderId) return res.status(400).json({ message: 'Source table has no active order' });
    if (toTable.currentOrderId) return res.status(400).json({ message: 'Destination table is already occupied' });

    // Move the order
    const orderId = fromTable.currentOrderId;
    
    // Update Order to reflect new table name
    await Order.findByIdAndUpdate(orderId, { tableNumber: toTable.name });

    // Update To Table
    toTable.currentOrderId = orderId;
    toTable.status = fromTable.status;
    toTable.guestsSeated = fromTable.guestsSeated;
    toTable.occupiedSince = fromTable.occupiedSince;
    await toTable.save();

    // Clear From Table
    fromTable.currentOrderId = undefined;
    fromTable.status = 'AVAILABLE';
    fromTable.guestsSeated = 0;
    fromTable.occupiedSince = undefined;
    await fromTable.save();

    return res.status(200).json({ message: 'Table transferred successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const mergeTables = async (req: Request, res: Response) => {
  try {
    const { primaryTableId, secondaryTableId } = req.body;
    const organizationId = req.user?.organizationId;

    const primaryTable = await Table.findOne({ _id: primaryTableId, organizationId });
    const secondaryTable = await Table.findOne({ _id: secondaryTableId, organizationId });

    if (!primaryTable || !secondaryTable) return res.status(404).json({ message: 'Table not found' });
    if (!primaryTable.currentOrderId) return res.status(400).json({ message: 'Primary table has no active order to merge into' });

    const orderId = primaryTable.currentOrderId;

    // Link secondary table to the same order
    secondaryTable.currentOrderId = orderId;
    secondaryTable.status = 'OCCUPIED';
    // Append to linked arrays
    if (!primaryTable.linkedOrderIds) primaryTable.linkedOrderIds = [];
    if (!primaryTable.linkedOrderIds.includes(secondaryTable._id as any)) {
      primaryTable.linkedOrderIds.push(secondaryTable._id as any);
    }
    
    await secondaryTable.save();
    await primaryTable.save();

    // Optionally update the Order's tableNumber string to represent the merge (e.g., "T1 + T2")
    await Order.findByIdAndUpdate(orderId, { tableNumber: primaryTable.name + ' + ' + secondaryTable.name });

    return res.status(200).json({ message: 'Tables merged successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};
`;

controller = controller + '\n' + tableOps;
fs.writeFileSync('server/src/controllers/table.controller.ts', controller);

// Update routes
let routes = fs.readFileSync('server/src/routes/table.routes.ts', 'utf8');

routes = routes.replace(
  "getTableDashboard,",
  "getTableDashboard,\n  transferTable,\n  mergeTables,"
);

routes = routes.replace(
  "router.get('/dashboard', getTableDashboard);",
  "router.get('/dashboard', getTableDashboard);\nrouter.post('/transfer', transferTable);\nrouter.post('/merge', mergeTables);"
);

fs.writeFileSync('server/src/routes/table.routes.ts', routes);

