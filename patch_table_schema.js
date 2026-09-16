const fs = require('fs');

// Patch Backend Model
let model = fs.readFileSync('server/src/models/Table.ts', 'utf8');

model = model.replace(
  "export interface ITable extends Document {",
  "export interface ITable extends Document {\n  floorPlan?: string;\n  shape?: 'square' | 'rectangle' | 'circle';\n  positionX?: number;\n  positionY?: number;\n  currentOrderId?: mongoose.Types.ObjectId;"
);

model = model.replace(
  "status: {",
  "floorPlan: { type: String, default: 'Main Dining' },\n    shape: { type: String, enum: ['square', 'rectangle', 'circle'], default: 'square' },\n    positionX: { type: Number, default: 0 },\n    positionY: { type: Number, default: 0 },\n    currentOrderId: { type: Schema.Types.ObjectId, ref: 'Order' },\n    status: {"
);

fs.writeFileSync('server/src/models/Table.ts', model);

// Patch Frontend Types
let types = fs.readFileSync('client/src/types/index.ts', 'utf8');

types = types.replace(
  "export interface Table {",
  "export interface Table {\n  floorPlan?: string;\n  shape?: 'square' | 'rectangle' | 'circle';\n  positionX?: number;\n  positionY?: number;\n  currentOrderId?: string;"
);

fs.writeFileSync('client/src/types/index.ts', types);
