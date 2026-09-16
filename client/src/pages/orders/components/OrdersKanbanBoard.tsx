import React from 'react';
import { Order } from '../../../types';
import { Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

interface OrdersKanbanBoardProps {
  orders: Order[];
  onOrderClick: (order: Order) => void;
  onStatusChange: (orderId: string, newStatus: string) => void;
}

export const OrdersKanbanBoard = ({ orders, onOrderClick, onStatusChange }: OrdersKanbanBoardProps) => {
  const columns = [
    { id: 'PENDING', title: 'New Orders', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
    { id: 'PREPARING', title: 'Preparing', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
    { id: 'COMPLETED', title: 'Completed', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
  ];

  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    e.dataTransfer.setData('orderId', orderId);
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('orderId');
    if (orderId) {
      onStatusChange(orderId, newStatus);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getSLAColor = (createdAt: string | Date, status: string) => {
    if (status === 'COMPLETED') return 'text-gray-400';
    const elapsedMinutes = (new Date().getTime() - new Date(createdAt).getTime()) / 60000;
    if (elapsedMinutes > 20) return 'text-rose-500 font-bold animate-pulse';
    if (elapsedMinutes > 10) return 'text-amber-500 font-bold';
    return 'text-emerald-500 font-medium';
  };

  return (
    <div className="flex gap-4 h-full min-h-[600px] overflow-x-auto pb-4">
      {columns.map(col => {
        const colOrders = orders.filter(o => o.status === col.id);
        
        return (
          <div 
            key={col.id} 
            className={clsx("flex-1 min-w-[300px] flex flex-col rounded-2xl border-2 p-3 transition-colors", col.bg, col.border)}
            onDrop={(e) => handleDrop(e, col.id)}
            onDragOver={handleDragOver}
          >
            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className={clsx("font-black text-lg uppercase tracking-wider", col.text)}>{col.title}</h3>
              <span className={clsx("px-2.5 py-0.5 rounded-full text-sm font-bold bg-white shadow-sm", col.text)}>
                {colOrders.length}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 hide-scrollbar">
              {colOrders.map(order => (
                <div 
                  key={order._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, order._id!)}
                  onClick={() => onOrderClick(order)}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-amber-300 hover:shadow-md cursor-pointer transition-all active:scale-[0.98]"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-black text-gray-900 text-lg leading-none">{order.orderNumber}</span>
                      <span className="block text-xs font-bold text-gray-400 mt-0.5">{order.orderType}</span>
                    </div>
                    <span className="font-bold text-gray-900">₹{order.grandTotal.toFixed(2)}</span>
                  </div>
                  
                  {order.customer?.name && (
                    <div className="text-sm font-medium text-gray-600 mb-2 truncate">
                      {order.customer.name}
                    </div>
                  )}

                  <div className="pt-2 mt-2 border-t border-gray-50 flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium">
                      {order.items.length} items
                    </span>
                    <div className={clsx("flex items-center gap-1", getSLAColor(order.createdAt, order.status))}>
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(order.createdAt), 'hh:mm a')}
                    </div>
                  </div>
                </div>
              ))}
              {colOrders.length === 0 && (
                <div className="h-24 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                  <p className="text-sm font-medium">Drop orders here</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
