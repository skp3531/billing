import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import { CurrencyRupeeIcon, ClipboardDocumentListIcon, RectangleGroupIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { getDashboardMetrics } from '../../api/analytics.api';
import { getTables } from '../../api/table.api';
import { getRawMaterials } from '../../api/inventory.api';

const DashboardPage = () => {
  const { user, currentOutlet, organization } = useAuthStore();
  const isTablesEnabled = organization?.modulesEnabled?.tables !== false;
  const isKitchenEnabled = organization?.modulesEnabled?.kitchen !== false;
  const [metrics, setMetrics] = useState({ todayRevenue: 0, todayOrders: 0 });
  const [topItems, setTopItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTables, setActiveTables] = useState('0');
  const [lowStock, setLowStock] = useState('0');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getDashboardMetrics();
        setMetrics(data.metrics);
        setTopItems(data.topItems);

        const [tables, materials] = await Promise.all([
          getTables().catch(() => []),
          getRawMaterials().then(res => res.data.data).catch(() => [])
        ]);
        setActiveTables(tables.filter((t: any) => t.status === 'OCCUPIED').length.toString());
        setLowStock(materials.filter((m: any) => m.currentStock <= m.minStockLevel).length.toString());
      } catch (error) {
        console.error('Failed to fetch metrics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [currentOutlet]);
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const statCards = [
    { title: "Today's Sales", value: `₹${metrics.todayRevenue.toFixed(2)}`, icon: CurrencyRupeeIcon, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Orders Today', value: metrics.todayOrders.toString(), icon: ClipboardDocumentListIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Active Tables', value: activeTables, icon: RectangleGroupIcon, color: 'text-amber-600', bg: 'bg-amber-100' },
    { title: 'Low Stock Items', value: lowStock, icon: ExclamationTriangleIcon, color: 'text-red-600', bg: 'bg-red-100' },
  ];


  const visibleCards = statCards.filter(stat => {
    if (stat.title === 'Active Tables' && !isTablesEnabled) return false;
    return true;
  });

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()}, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening at {currentOutlet?.name || 'your outlet'} on {format(new Date(), 'EEEE, MMMM do, yyyy')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {visibleCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? '...' : stat.value}</p>
            </div>
            <p className="text-xs text-gray-400 mt-4">Data will appear once transactions are recorded</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Top Selling Items Today</h2>
          {loading ? (
            <p>Loading...</p>
          ) : topItems.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {topItems.map((item) => (
                <li key={item._id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.quantitySold} sold</p>
                  </div>
                  <div className="font-medium text-green-600">
                    ₹{item.revenue.toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No items sold today yet.</p>
          )}
        </div>
      </div>
      
      <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
      <div className="flex flex-wrap gap-4">
         <Link to="/pos" className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded shadow block">New Order</Link>
         <Link to="/orders" className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded shadow block">View Orders</Link>
         <Link to="/menu" className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded shadow block">Menu</Link>
         {isKitchenEnabled && <Link to="/kitchen" className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded shadow block">Kitchen</Link>}
      </div>
    </div>
  );
};

export default DashboardPage;
