const fs = require('fs');

let model = fs.readFileSync('server/src/models/Outlet.ts', 'utf8');

// Types
model = model.replace(
  "isTableManagementActive: boolean;",
  "isTableManagementActive: boolean;\n  printerSize?: '58mm' | '80mm';\n  taxRate?: number;"
);

// Schema
model = model.replace(
  "isTableManagementActive: { type: Boolean, default: true },",
  "isTableManagementActive: { type: Boolean, default: true },\n    printerSize: { type: String, enum: ['58mm', '80mm'], default: '80mm' },\n    taxRate: { type: Number, default: 5 },"
);

fs.writeFileSync('server/src/models/Outlet.ts', model);

// Also patch client types if any
let types = fs.readFileSync('client/src/types/index.ts', 'utf8');
if (types.includes("export interface Outlet")) {
  types = types.replace(
    "isTableManagementActive: boolean;",
    "isTableManagementActive: boolean;\n  printerSize?: '58mm' | '80mm';\n  taxRate?: number;"
  );
  fs.writeFileSync('client/src/types/index.ts', types);
}
