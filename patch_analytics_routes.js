const fs = require('fs');
let content = fs.readFileSync('server/src/routes/analytics.routes.ts', 'utf8');

content = content.replace(
  "import { Router } from 'express';",
  "import { Router } from 'express';\nimport { getCommandCenterData } from '../controllers/commandCenter.controller';"
);

content = content.replace(
  "router.get('/dashboard-kpis', getDashboardKPIs);",
  "router.get('/dashboard-kpis', getDashboardKPIs);\nrouter.get('/command-center', getCommandCenterData);"
);

fs.writeFileSync('server/src/routes/analytics.routes.ts', content);
