import React, { useEffect, useState } from 'react';
import { orderApi } from '../../api/order.api';
import { Order } from '../../types';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function KitchenPage() {
  const currentOutletId = useAuthStore(state => state.currentOutlet?._id);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [selectedStation, setSelectedStation] = useState<string>('ALL');

  const fetchPreparingOrders = async () => {
    if (!currentOutletId) return;
    try {
      setLoading(true);
      const data = await orderApi.getOrders(currentOutletId, { filter: 'active' });
      setOrders(data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch KOTs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreparingOrders();
    const interval = setInterval(fetchPreparingOrders, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, [currentOutletId]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 60000); // update current time every minute
    return () => clearInterval(timer);
  }, []);

  const handleStartPreparing = async (orderId: string) => {
    try {
      await orderApi.updateOrderStatus(orderId, 'PREPARING');
      toast.success('Order moved to preparing');
      fetchPreparingOrders();
    } catch (error: any) {
      toast.error('Failed to update order status');
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      await orderApi.updateOrderStatus(orderId, 'COMPLETED');
      toast.success('Order marked as completed');
      fetchPreparingOrders();
    } catch (error: any) {
      toast.error('Failed to update order status');
    }
  };

  const handleBumpItem = async (orderId: string, itemId: string) => {
    try {
      await orderApi.updateOrderItemStatus(orderId, itemId, 'PREPARED');
      toast.success('Item prepared');
      fetchPreparingOrders();
    } catch (error: any) {
      toast.error('Failed to bump item');
    }
  };

  if (loading && orders.length === 0) return <div className="p-4">Loading Kitchen Board...</div>;

  const getTimerStyles = (createdAt: string) => {
    const diffMins = (currentTime - new Date(createdAt).getTime()) / 60000;
    if (diffMins > 15) return 'bg-red-100 border-red-500';
    if (diffMins > 10) return 'bg-yellow-100 border-yellow-500';
    return 'bg-amber-50 border-amber-200';
  };

  // Collect all unique stations
  const stations = Array.from(new Set(orders.flatMap(o => o.items.map(i => i.station || 'GENERAL'))));
  
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-amber-900">Kitchen Display System (KDS)</h1>
        
        <div className="flex space-x-4">
          <select 
            value={selectedStation} 
            onChange={(e) => setSelectedStation(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm focus:border-amber-500 focus:ring-amber-500"
          >
            <option value="ALL">All Stations</option>
            {stations.map(st => (
              <option key={st} value={st}>{st.toUpperCase()}</option>
            ))}
          </select>

          <button onClick={fetchPreparingOrders} className="text-amber-600 hover:text-amber-800 bg-amber-50 px-4 py-2 rounded-md shadow-sm border border-amber-200">
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {orders.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No active orders to prepare.
          </div>
        ) : (
          orders.map((order) => {
            const timerStyles = getTimerStyles(order.createdAt);
            const diffMins = Math.floor((currentTime - new Date(order.createdAt).getTime()) / 60000);
            
            // Filter items by station
            const displayItems = order.items.filter(item => 
              selectedStation === 'ALL' ? true : (item.station || 'GENERAL') === selectedStation
            );

            if (displayItems.length === 0 && selectedStation !== 'ALL') return null;
            
            const allItemsPrepared = order.items.every(i => i.status === 'PREPARED');

            return (
              <div key={order._id} className={`rounded-lg shadow border-2 overflow-hidden flex flex-col ${timerStyles}`}>
                <div className={`${diffMins > 15 ? 'bg-red-600' : diffMins > 10 ? 'bg-yellow-600' : 'bg-amber-600'} text-white p-3 flex justify-between items-center`}>
                  <span className="font-bold">#{order.orderNumber}</span>
                  {order.status === 'PENDING' && (
                    <button 
                      onClick={() => handleStartPreparing(order._id)}
                      className="ml-2 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded"
                    >
                      Start Preparing
                    </button>
                  )}
                  <span className="text-sm px-2 py-1 rounded capitalize font-medium flex items-center space-x-2">
                    <span>{diffMins}m</span>
                    <span>|</span>
                    <span>{(order.type || order.orderType || '').replace('_', ' ')}</span>
                  </span>
                </div>
                
                <div className="p-4 flex-grow bg-white bg-opacity-50">
                  <div className="mb-2 text-sm text-gray-800 flex justify-between font-semibold border-b border-gray-300 pb-2">
                    <span>Table: {order.tableNumber || 'N/A'}</span>
                    <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
                  </div>
                  
                  <ul className="space-y-3 mt-4">
                    {displayItems.map((item, idx: number) => (
                      <li key={idx} className={`flex justify-between items-start border-b border-gray-200 pb-2 ${item.status === 'PREPARED' ? 'opacity-50 line-through' : ''}`}>
                        <div className="flex-grow pr-2">
                          <div className="font-medium text-lg">{item.quantity} x {item.name}</div>
                          {item.variant && <div className="text-sm text-gray-600">Size: {typeof item.variant === 'string' ? item.variant : item.variant.name}</div>}
                          {item.modifiers && item.modifiers.length > 0 && (
                            <div className="text-sm text-gray-600">
                              Add: {item.modifiers.map(m => m.name).join(', ')}
                            </div>
                          )}
                          {item.notes && <div className="text-sm text-red-600 font-bold bg-red-100 p-1 rounded mt-1">Note: {item.notes}</div>}
                        </div>
                        {item.status !== 'PREPARED' && item._id && (
                          <button 
                            onClick={() => handleBumpItem(order._id, item._id!)}
                            className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded border border-blue-300 font-semibold mt-1"
                          >
                            Bump
                          </button>
                        )}
                        {item.status === 'PREPARED' && (
                          <span className="text-xs text-green-600 font-bold mt-1">Done</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="p-3 bg-gray-50 border-t border-gray-200">
                  <button
                    onClick={() => handleCompleteOrder(order._id)}
                    disabled={order.status === 'PENDING'}
                    className={`w-full py-2 rounded font-semibold transition-colors ${allItemsPrepared ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                  >
                    {order.status === 'PENDING' ? 'Waiting to start' : (allItemsPrepared ? 'Mark Order Ready' : 'Complete Order')}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
