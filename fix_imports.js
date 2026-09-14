const fs = require('fs');

let dbContent = fs.readFileSync('client/src/utils/db.ts', 'utf8');
dbContent = dbContent.replace(
  "import { ICategory, IMenuItem } from '../types';",
  "import { Category, MenuItem } from '../types';"
);
dbContent = dbContent.replace(/<ICategory, string>/g, "<Category, string>");
dbContent = dbContent.replace(/<IMenuItem, string>/g, "<MenuItem, string>");
fs.writeFileSync('client/src/utils/db.ts', dbContent);

let syncContent = fs.readFileSync('client/src/hooks/useOfflineSync.ts', 'utf8');
syncContent = syncContent.replace(
  "import { orderApi } from '../api';",
  "import * as orderApi from '../api/order.api';"
);
fs.writeFileSync('client/src/hooks/useOfflineSync.ts', syncContent);
