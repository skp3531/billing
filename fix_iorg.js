const fs = require('fs');

let content = fs.readFileSync('server/src/models/Organization.ts', 'utf8');
content = content.replace(
  "currency?: string;\n  allowNegativeStock?: boolean;",
  "currency?: string;"
);
content = content.replace(
  "gstin?: string;\n  active: boolean;",
  "gstin?: string;\n  allowNegativeStock: boolean;\n  active: boolean;"
);
fs.writeFileSync('server/src/models/Organization.ts', content);
