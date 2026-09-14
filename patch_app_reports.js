const fs = require('fs');
let content = fs.readFileSync('client/src/App.tsx', 'utf8');

// Replace the single reports route with the nested ones
content = content.replace(
  "import ReportsPage from './pages/reports/ReportsPage';",
  `import ReportsLayout from './pages/reports/ReportsLayout';
import DashboardView from './pages/reports/DashboardView';
import SalesView from './pages/reports/SalesView';
import ProductsView from './pages/reports/ProductsView';
import CustomersView from './pages/reports/CustomersView';
import CashView from './pages/reports/CashView';
import InventoryView from './pages/reports/InventoryView';
import PnlView from './pages/reports/PnlView';
import GstView from './pages/reports/GstView';
import InsightsView from './pages/reports/InsightsView';`
);

const oldRoute = '<Route path="reports" element={<PermissionGuard permission="reports.view"><ReportsPage /></PermissionGuard>} />';
const newRoute = `<Route path="reports" element={<PermissionGuard permission="reports.view"><ReportsLayout /></PermissionGuard>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardView />} />
            <Route path="sales" element={<SalesView />} />
            <Route path="products" element={<ProductsView />} />
            <Route path="customers" element={<CustomersView />} />
            <Route path="cash" element={<CashView />} />
            <Route path="inventory" element={<InventoryView />} />
            <Route path="pnl" element={<PnlView />} />
            <Route path="gst" element={<GstView />} />
            <Route path="insights" element={<InsightsView />} />
          </Route>`;

content = content.replace(oldRoute, newRoute);
fs.writeFileSync('client/src/App.tsx', content);
