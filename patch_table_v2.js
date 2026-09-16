const fs = require('fs');
let model = fs.readFileSync('server/src/models/Table.ts', 'utf8');

// Update Interface
model = model.replace(
  "export interface ITable extends Document {",
  `export interface ITable extends Document {
  rotation?: number;
  width?: number;
  height?: number;
  assignedWaiterId?: mongoose.Types.ObjectId;
  guestsSeated?: number;
  occupiedSince?: Date;
  linkedOrderIds?: mongoose.Types.ObjectId[];`
);

// Update Status Enum in Interface
model = model.replace(
  "status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';",
  "status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'BILLING_PENDING' | 'CLEANING' | 'DISABLED';"
);

// Update Schema
model = model.replace(
  "positionY: { type: Number, default: 0 },",
  `positionY: { type: Number, default: 0 },
    rotation: { type: Number, default: 0 },
    width: { type: Number, default: 80 },
    height: { type: Number, default: 80 },
    assignedWaiterId: { type: Schema.Types.ObjectId, ref: 'User' },
    guestsSeated: { type: Number, default: 0 },
    occupiedSince: { type: Date },
    linkedOrderIds: [{ type: Schema.Types.ObjectId, ref: 'Order' }],`
);

// Update Enum in Schema
model = model.replace(
  "enum: ['AVAILABLE', 'OCCUPIED', 'RESERVED'],",
  "enum: ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'BILLING_PENDING', 'CLEANING', 'DISABLED'],"
);

fs.writeFileSync('server/src/models/Table.ts', model);
