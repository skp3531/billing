const fs = require('fs');

let content = fs.readFileSync('client/src/types/index.ts', 'utf8');

content = content.replace(
  "basePrice: number;",
  "basePrice: number;\n  taxRate: number;\n  taxType: 'INCLUSIVE' | 'EXCLUSIVE';"
);

fs.writeFileSync('client/src/types/index.ts', content);
