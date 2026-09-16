const fs = require('fs');
let api = fs.readFileSync('client/src/api/table.api.ts', 'utf8');

api = api.replace(
  "export interface Table {",
  "export interface Table {\n  floorPlan?: string;\n  shape?: 'square' | 'rectangle' | 'circle';\n  positionX?: number;\n  positionY?: number;\n  currentOrderId?: string;"
);

fs.writeFileSync('client/src/api/table.api.ts', api);
