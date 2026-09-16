const fs = require('fs');
let content = fs.readFileSync('server/src/routes/menuItem.routes.ts', 'utf8');

content = content.replace(
  "import { Router } from 'express';",
  "import { Router } from 'express';\nimport { getMenuEngineering } from '../controllers/menuItem.controller';"
);

content = content.replace(
  "router.get('/', getMenuItems);",
  "router.get('/engineering', getMenuEngineering);\nrouter.get('/', getMenuItems);"
);

fs.writeFileSync('server/src/routes/menuItem.routes.ts', content);
