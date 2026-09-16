const fs = require('fs');

let content = fs.readFileSync('client/src/pages/orders/OrdersPage.tsx', 'utf8');

// Imports
content = content.replace(
  "import { OrderDetailsDrawer } from './components/OrderDetailsDrawer';",
  "import { OrderDetailsDrawer } from './components/OrderDetailsDrawer';\nimport { OrdersKanbanBoard } from './components/OrdersKanbanBoard';"
);

// Add Polling useEffect
const fetchOrdersFunction = `  const fetchOrders = async (silent = false) => {
    if (!currentOutlet) return;
    try {
      if (!silent) setLoading(true);
      const data = await orderApi.getOrders(currentOutlet._id, { startDate: startDate.toISOString(), endDate: endDate.toISOString(), limit: 500 });
      setOrders(data.data);
    } catch (err) {
      if (!silent) toast.error('Failed to load orders');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const intervalId = setInterval(() => {
      fetchOrders(true);
    }, 15000); // 15 seconds polling for SLA and live orders
    return () => clearInterval(intervalId);
  }, [currentOutlet, startDate, endDate]);`;

content = content.replace(/  const fetchOrders = async \(\) => \{[\s\S]*?\}, \[currentOutlet, startDate, endDate\]\);/m, fetchOrdersFunction);

// Add onStatusChange handler
const statusHandler = `  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await orderApi.updateOrderStatus(orderId, newStatus);
      toast.success(\`Order moved to \${newStatus}\`);
      fetchOrders(true);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };`;

content = content.replace("  const handleOrderClick = (order: Order) => {", statusHandler + "\n\n  const handleOrderClick = (order: Order) => {");

// Render Kanban View
content = content.replace(
  "<div className=\"bg-white p-12 rounded-xl border border-gray-100 text-center font-bold text-gray-500 shadow-sm\">\n            Kanban Board View (Coming in Phase 2)\n          </div>",
  "<OrdersKanbanBoard orders={orders} onOrderClick={handleOrderClick} onStatusChange={handleStatusChange} />"
);

fs.writeFileSync('client/src/pages/orders/OrdersPage.tsx', content);
