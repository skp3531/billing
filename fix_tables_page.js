const fs = require('fs');

let content = fs.readFileSync('client/src/pages/tables/TablesPage.tsx', 'utf8');

content = content.replace(
  "{/* TABLE SIDEBAR (Slide out info card) */}",
  "{/* TABLE SIDEBAR (Info card or Edit Panel) */}"
);

content = content.replace(
  "{selectedTableForSidebar && !isEditMode && (",
  "{(selectedTableForSidebar || isEditMode) && ("
);

content = content.replace(
  "<TableSidebar \n          table={selectedTableForSidebar} \n          onClose={() => setSelectedTableForSidebar(null)} \n          onStatusChange={async (id, status) => {\n             await updateTable(id, { status });\n             fetchData();\n          }}\n          onUpdate={fetchData}\n        />",
  `<TableSidebar 
          table={selectedTableForSidebar}
          isEditMode={isEditMode}
          onAddTable={async (data) => {
            try {
              const res = await createTable({ ...data, outletId: currentOutlet?._id });
              toast.success('Table added');
              fetchData();
            } catch (err) {
              toast.error('Failed to add table');
            }
          }}
          onClose={() => setSelectedTableForSidebar(null)} 
          onStatusChange={async (id, status) => {
             await updateTable(id, { status });
             fetchData();
          }}
          onUpdate={fetchData}
        />`
);

fs.writeFileSync('client/src/pages/tables/TablesPage.tsx', content);
