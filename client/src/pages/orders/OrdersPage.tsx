import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useDateFilter, DateFilterProvider } from '../../contexts/DateFilterContext';
import { useAuthStore } from '../../store/authStore';
import { Order } from '../../types';
import { orderApi } from '../../api/order.api';
import { OrderDashboardKPIs } from './components/OrderDashboardKPIs';
import { OrdersList } from './components/OrdersList';
import { OrderDetailsDrawer } from './components/OrderDetailsDrawer';
import { LayoutDashboard, ListTodo } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

const DateSelector = () => {
  const { preset, setPreset, startDate, endDate } = useDateFilter();
  const presets: { label: string; value: any }[] = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 7 Days', value: 'last_7_days' },
    { label: 'This Month', value: 'this_month' },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
      <div className="flex space-x-2 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar bg-white p-1.5 rounded-xl border border-gray-100 shadow-sm">
        {presets.map((p) => (
          <button
            key={p.value}
            onClick={() => setPreset(p.value)}
            className={clsx(
              "px-4 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap transition-colors",
              preset === p.value 
                ? "bg-gray-900 text-white" 
                : "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="text-sm text-gray-500 font-bold px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm">
        {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
      </div>
    </div>
  );
};

const OrdersContent = () => {
  const { currentOutlet } = useAuthStore();
  const { startDate, endDate } = useDateFilter();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'kanban'>('list');
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchOrders = async () => {
    if (!currentOutlet) return;
    try {
      setLoading(true);
      const data = await orderApi.getOrders(currentOutlet._id, { startDate: startDate.toISOString(), endDate: endDate.toISOString(), limit: 500 });
      setOrders(data.data);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentOutlet, startDate, endDate]);

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  return (
    <div className="p-6 h-[calc(100vh-4rem)] overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Order Management</h1>
            <p className="text-sm font-medium text-gray-500">Control center for fulfillment and operations</p>
          </div>
          
          <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
            <button onClick={() => setView('list')} className={clsx("p-2 rounded transition-colors", view === 'list' ? 'bg-amber-50 text-amber-600' : 'text-gray-400 hover:bg-gray-50')}>
              <ListTodo className="w-5 h-5" />
            </button>
            <button onClick={() => setView('kanban')} className={clsx("p-2 rounded transition-colors", view === 'kanban' ? 'bg-amber-50 text-amber-600' : 'text-gray-400 hover:bg-gray-50')}>
              <LayoutDashboard className="w-5 h-5" />
            </button>
          </div>
        </div>

        <DateSelector />
        
        {!loading && <OrderDashboardKPIs orders={orders} />}

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-gray-200 rounded-xl w-full"></div>
          </div>
        ) : view === 'list' ? (
          <OrdersList orders={orders} onOrderClick={handleOrderClick} />
        ) : (
          <div className="bg-white p-12 rounded-xl border border-gray-100 text-center font-bold text-gray-500 shadow-sm">
            Kanban Board View (Coming in Phase 2)
          </div>
        )}
      </div>

      <OrderDetailsDrawer 
        order={selectedOrder} 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        onPrint={() => toast('Print feature triggered')}
        onCancel={() => toast('Cancel feature triggered')}
      />
    </div>
  );
};

const OrdersPage = () => (
  <DateFilterProvider>
    <OrdersContent />
  </DateFilterProvider>
);

export default OrdersPage;
