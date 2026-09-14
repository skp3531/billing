const fs = require('fs');

let content = fs.readFileSync('server/src/routes/analytics.routes.ts', 'utf8');
content = content.replace(
  "import { authorize } from '../middleware/authorize';",
  "import { requirePermission } from '../middleware/authorize';\nimport { PERMISSIONS } from '../utils/permissions';"
);
content = content.replace(/authorize\([^\)]*\)/g, "requirePermission(PERMISSIONS.REPORTS_VIEW)");
fs.writeFileSync('server/src/routes/analytics.routes.ts', content);
