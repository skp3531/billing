const fs = require('fs');

let syncContent = fs.readFileSync('client/src/hooks/useOfflineSync.ts', 'utf8');
syncContent = syncContent.replace(
  "import * as orderApi from '../api/order.api';",
  "import { orderApi } from '../api/order.api';"
);
fs.writeFileSync('client/src/hooks/useOfflineSync.ts', syncContent);
