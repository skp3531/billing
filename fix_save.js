const fs = require('fs');
let content = fs.readFileSync('client/src/pages/tables/TablesPage.tsx', 'utf8');

content = content.replace(
  "updateTable(t._id, { positionX: t.positionX, positionY: t.positionY })",
  "updateTable(t._id, { positionX: t.positionX, positionY: t.positionY, width: t.width, height: t.height, rotation: t.rotation })"
);

fs.writeFileSync('client/src/pages/tables/TablesPage.tsx', content);
