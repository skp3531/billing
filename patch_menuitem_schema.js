const fs = require('fs');

let model = fs.readFileSync('server/src/models/MenuItem.ts', 'utf8');
model = model.replace(
  "export interface IMenuItem extends Document {",
  "export interface IMenuItem extends Document {\n  kitchenStation?: string;"
);
model = model.replace(
  "organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },",
  "organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },\n    kitchenStation: { type: String, default: 'MAIN' },"
);
fs.writeFileSync('server/src/models/MenuItem.ts', model);

let types = fs.readFileSync('client/src/types/index.ts', 'utf8');
types = types.replace(
  "export interface MenuItem {",
  "export interface MenuItem {\n  kitchenStation?: string;"
);
fs.writeFileSync('client/src/types/index.ts', types);
