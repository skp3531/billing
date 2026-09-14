const fs = require('fs');

let model = fs.readFileSync('server/src/models/MenuItem.ts', 'utf8');
model = model.replace(
  "taxType: 'INCLUSIVE' | 'EXCLUSIVE';",
  "taxType: 'INCLUSIVE' | 'EXCLUSIVE';\n  hsnCode?: string;"
);
model = model.replace(
  "taxType: { type: String, enum: ['INCLUSIVE', 'EXCLUSIVE'], default: 'EXCLUSIVE' },",
  "taxType: { type: String, enum: ['INCLUSIVE', 'EXCLUSIVE'], default: 'EXCLUSIVE' },\n    hsnCode: { type: String },"
);
fs.writeFileSync('server/src/models/MenuItem.ts', model);

let types = fs.readFileSync('client/src/types/index.ts', 'utf8');
types = types.replace(
  "taxType: 'INCLUSIVE' | 'EXCLUSIVE';",
  "taxType: 'INCLUSIVE' | 'EXCLUSIVE';\n  hsnCode?: string;"
);
fs.writeFileSync('client/src/types/index.ts', types);
