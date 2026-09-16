const fs = require('fs');
let content = fs.readFileSync('client/src/pages/menu/MenuPage.tsx', 'utf8');

content = content.replace(
  "TrendingUp, AlertTriangle } from 'lucide-react';",
  "TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';"
);

content = content.replace(
  "onSave={() => {",
  "onSave={async () => {"
);

fs.writeFileSync('client/src/pages/menu/MenuPage.tsx', content);
