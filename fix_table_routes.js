const fs = require('fs');
let routes = fs.readFileSync('server/src/routes/table.routes.ts', 'utf8');

routes = routes.replace(
  "import { PERMISSIONS } from '../types/permissions';",
  "import { PERMISSIONS } from '../utils/permissions';"
);
fs.writeFileSync('server/src/routes/table.routes.ts', routes);
