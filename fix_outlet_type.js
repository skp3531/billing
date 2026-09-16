const fs = require('fs');

let types = fs.readFileSync('client/src/types/index.ts', 'utf8');

types = types.replace(
  "export interface Outlet {",
  "export interface Outlet {\n  taxRate?: number;\n  printerSize?: '58mm' | '80mm';"
);

fs.writeFileSync('client/src/types/index.ts', types);
