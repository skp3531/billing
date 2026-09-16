const fs = require('fs');

let content = fs.readFileSync('client/src/pages/tables/TablesPage.tsx', 'utf8');

content = content.replace(
  "<TableSidebar \n          table={selectedTableForSidebar}\n          isEditMode={isEditMode}",
  "<TableSidebar \n          table={selectedTableForSidebar}\n          allTables={tables}\n          isEditMode={isEditMode}"
);

fs.writeFileSync('client/src/pages/tables/TablesPage.tsx', content);
