const fs = require('fs');
let db = fs.readFileSync('client/src/utils/db.ts', 'utf8');

db = db.replace(
  "menu: '++id, organizationId, categoryId, name',",
  "menu: '++id, organizationId, categoryId, name',\n    holdBills: '++id, orderType, createdAt',"
);

// Add the table to the class
db = db.replace(
  "menu!: Table<MenuItem>;",
  "menu!: Table<MenuItem>;\n  holdBills!: Table<any>;"
);

fs.writeFileSync('client/src/utils/db.ts', db);
