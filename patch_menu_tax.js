const fs = require('fs');

let content = fs.readFileSync('server/src/models/MenuItem.ts', 'utf8');

content = content.replace(
  "basePrice: number;",
  "basePrice: number;\n  taxRate: number;\n  taxType: 'INCLUSIVE' | 'EXCLUSIVE';"
);

content = content.replace(
  "basePrice: { type: Number, required: true },",
  "basePrice: { type: Number, required: true },\n    taxRate: { type: Number, default: 5 },\n    taxType: { type: String, enum: ['INCLUSIVE', 'EXCLUSIVE'], default: 'EXCLUSIVE' },"
);

fs.writeFileSync('server/src/models/MenuItem.ts', content);
