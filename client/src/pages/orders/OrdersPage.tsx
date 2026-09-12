import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { Order, OrderStatus } from '../../types';
import { printerApi, PrinterSetting } from '../../api/printer.api';
import ReceiptTemplate from '../../components/print/ReceiptTemplate';
import { orderApi } from '../../api/order.api';
import api from '../../api/axios';
import { XMarkIcon, EyeIcon, CheckIcon, CheckCircleIcon, PlayIcon, HandThumbUpIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  placed: 'bg-blue-100 text-blue-800',
  pending: 'bg-blue-100 text-blue-800',
  accepted: 'bg-purple-100 text-purple-800',
  preparing: 'bg-amber-100 text-amber-800',
  ready: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const OrdersPage = () => {
  const { currentOutlet, organization } = useAuthStore();
  const isKitchenEnabled = organization?.modulesEnabled?.kitchen ?? true;
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [pastOrders, setPastOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [printerSettings, setPrinterSettings] = useState<PrinterSetting[]>([]);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [currentOutlet, page]);

  
  const filteredPastOrders = pastOrders.filter(o => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customer?.name?.toLowerCase().includes(q) ||
      o.customer?.phone?.includes(q)
    );
  });

  const fetchOrders = async () => {
    if (!currentOutlet) return;
    try {
      setLoading(true);
      const activeRes = await orderApi.getOrders(currentOutlet._id, { filter: 'active', page: 1, limit: 100 });
      setActiveOrders(activeRes.data);
      
      const pastRes = await orderApi.getOrders(currentOutlet._id, { filter: 'past', page, limit: 20 });
      setPastOrders(pastRes.data);
      setTotalPages(pastRes.pagination.totalPages);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: OrderStatus, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await orderApi.updateOrderStatus(orderId, status);
      toast.success(`Order marked as ${status}`);
      fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to completely delete this order? This cannot be undone.')) return;
    try {
      await api.delete(`/orders/${orderId}`);
      toast.success('Order deleted');
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      toast.error('Failed to delete order');
    }
  };

  
  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="p-6 pb-4 shrink-0 border-b bg-white flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">Manage active orders and view order history.</p>
        </div>
        <button onClick={fetchOrders} className="text-sm font-medium text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg">
          Refresh
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" /></div>
        ) : (
          <div className="space-y-8">
            {/* Active Orders Section */}
            {isKitchenEnabled && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                Active Orders
                <span className="bg-amber-100 text-amber-800 text-xs py-0.5 px-2 rounded-full">{activeOrders.length}</span>
              </h2>
              {activeOrders.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
                  No active orders right now.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {activeOrders.map(order => (
                    <div 
                      key={order._id}
                      onClick={() => setSelectedOrder(order)}
                      className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="text-sm font-bold text-gray-900">#{order.orderNumber}</span>
                          <div className="text-xs text-gray-500 mt-0.5">{format(new Date(order.createdAt), 'h:mm a')}</div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[order.status.toLowerCase() as OrderStatus]}`}>
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded capitalize">
                          {(order.type || order.orderType || '').replace('_', ' ')}
                        </span>
                        {order.tableNumber && (
                          <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            Table {order.tableNumber}
                          </span>
                        )}
                      </div>

                      <div className="text-sm text-gray-600 mb-4 flex-1">
                        {order.items.length} items • ₹{order.grandTotal.toFixed(2)}
                      </div>

                      <div className="flex gap-2 mt-auto pt-3 border-t">
                        {order.status === 'PENDING' && (
                          <button onClick={(e) => updateStatus(order._id, 'accepted', e)} className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-700 py-1.5 rounded-lg text-sm font-semibold transition-colors">Accept</button>
                        )}
                        {order.status === 'PENDING' && (
                          <button onClick={(e) => updateStatus(order._id, 'PREPARING', e)} className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-700 py-1.5 rounded-lg text-sm font-semibold transition-colors">Prepare</button>
                        )}
                        {order.status === 'PREPARING' && (
                          <button onClick={(e) => updateStatus(order._id, 'ready', e)} className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-700 py-1.5 rounded-lg text-sm font-semibold transition-colors">Ready</button>
                        )}
                        {order.status === 'PREPARING' && (
                          <button onClick={(e) => updateStatus(order._id, 'COMPLETED', e)} className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 py-1.5 rounded-lg text-sm font-semibold transition-colors">Complete</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
            )}

            {/* Past Orders Section (limit to last 10 for display) */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <h2 className="text-lg font-bold text-gray-900">Recent Past Orders</h2>
                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search invoice, customer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-amber-500 focus:border-amber-500 text-sm"
                  />
                </div>
              </div>

              {pastOrders.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
                  No past orders.
                </div>
              ) : (
                <div className="bg-white border rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-gray-700">Order #</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Time</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Type</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Total</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {pastOrders.slice(0, 10).map(order => (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">#{order.orderNumber}</td>
                          <td className="px-4 py-3 text-gray-500">{format(new Date(order.createdAt), 'MMM d, h:mm a')}</td>
                          <td className="px-4 py-3 capitalize text-gray-600">{(order.type || order.orderType || '').replace('_', ' ')}</td>
                          <td className="px-4 py-3 font-medium">₹{order.grandTotal.toFixed(2)}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[order.status.toLowerCase() as OrderStatus]}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => setSelectedOrder(order)} className="text-amber-600 hover:text-amber-700 p-1">
                              <EyeIcon className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 px-4">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border rounded-md disabled:opacity-50 text-sm font-medium"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                  <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border rounded-md disabled:opacity-50 text-sm font-medium"
                  >
                    Next
                  </button>
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-50">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-slide-in-right">
            <div className="p-6 border-b bg-gray-50 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Order #{selectedOrder.orderNumber}</h3>
                <p className="text-sm text-gray-500 mt-1">{format(new Date(selectedOrder.createdAt), 'MMM d, yyyy - h:mm a')}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg font-bold hover:bg-amber-200 transition-colors">
                  Print Bill
                </button>
                <button onClick={() => handleDelete(selectedOrder._id)} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-bold hover:bg-red-200 transition-colors">
                  Delete
                </button>
                <button onClick={() => setSelectedOrder(null)} className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${statusColors[selectedOrder.status.toLowerCase() as OrderStatus]}`}>
                  {selectedOrder.status}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 capitalize">
                  {(selectedOrder.type || selectedOrder.orderType || '').replace('_', ' ')}
                </span>
                {selectedOrder.tableNumber && (
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700">
                    Table {selectedOrder.tableNumber}
                  </span>
                )}
              </div>

              {(selectedOrder.customer?.name || selectedOrder.customer?.phone) && (
                <div className="bg-gray-50 p-4 rounded-xl border">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Customer Details</h4>
                  {selectedOrder.customer?.name && <p className="font-medium">{selectedOrder.customer?.name}</p>}
                  {selectedOrder.customer?.phone && <p className="text-gray-600">{selectedOrder.customer?.phone}</p>}
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="flex gap-3">
                        <span className="font-semibold text-gray-500">{item.quantity}x</span>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          {item.variant && <p className="text-xs text-gray-500">{typeof item.variant === 'string' ? item.variant : item.variant.name}</p>}
                          {item.modifiers?.map(m => (
                            <p key={m.name} className="text-xs text-gray-500">+ {m.name}</p>
                          ))}
                        </div>
                      </div>
                      <span className="font-medium">₹{(item.itemTotal || item.subtotal || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>₹{selectedOrder.taxTotal.toFixed(2)}</span>
                </div>
                {selectedOrder.discountTotal > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{selectedOrder.discountTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t text-gray-900">
                  <span>Total</span>
                  <span>₹{selectedOrder.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Payment Info</h4>
                <div className="flex justify-between items-center">
                  <span className="capitalize font-medium text-gray-700">{selectedOrder.paymentMethod || 'Not specified'}</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    selectedOrder.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' :
                    selectedOrder.paymentStatus === 'UNPAID' ? 'bg-red-100 text-red-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedOrder.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {selectedOrder.status !== 'COMPLETED' && selectedOrder.status !== 'CANCELLED' && (
              <div className="p-6 border-t bg-white shrink-0 space-y-3">
                                {selectedOrder.status === 'PENDING' && (
                  <button onClick={() => updateStatus(selectedOrder._id, 'PREPARING')} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-colors">Start Preparing</button>
                )}
                                {selectedOrder.status === 'PREPARING' && (
                  <button onClick={() => updateStatus(selectedOrder._id, 'COMPLETED')} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors">Complete Order</button>
                )}
                <button onClick={() => updateStatus(selectedOrder._id, 'CANCELLED')} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors">Cancel Order</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
