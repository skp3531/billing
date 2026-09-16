const fs = require('fs');
let routes = fs.readFileSync('server/src/routes/table.routes.ts', 'utf8');

if (!routes.includes("getTableDashboard")) {
  routes = routes.replace(
    "export const updateTable =", // wait, looking at imports
    ""
  );
  
  routes = routes.replace(
    "import { getTables, createTable, updateTable, deleteTable } from '../controllers/table.controller';",
    "import { getTables, createTable, updateTable, deleteTable, getTableDashboard } from '../controllers/table.controller';"
  );
  
  routes = routes.replace(
    "router.get('/',",
    "router.get('/dashboard', requirePermission(PERMISSIONS.TABLE_VIEW), getTableDashboard);\n\nrouter.get('/',"
  );
}

fs.writeFileSync('server/src/routes/table.routes.ts', routes);
