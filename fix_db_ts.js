const fs = require('fs');
let db = fs.readFileSync('client/src/utils/db.ts', 'utf8');

db = db.replace(
  "offlineOrders: '++id, status'",
  "offlineOrders: '++id, status',\n      holdBills: '++id, orderType, createdAt'"
);

db = db.replace(
  "offlineOrders!: Table<OfflineOrder, string>;",
  "offlineOrders!: Table<OfflineOrder, string>;\n  holdBills!: Table<any>;"
);

// We need to increment the version number to 2 because we added a table!
db = db.replace("this.version(1).stores({", "this.version(2).stores({");

fs.writeFileSync('client/src/utils/db.ts', db);
