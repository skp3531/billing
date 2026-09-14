import React from 'react';
import { Order } from '../../../types';
import { format } from 'date-fns';
import clsx from 'clsx';
import { FileText, Eye } from 'lucide-react';

interface OrdersListProps {
  orders: Order[];
  onOrderClick: (order: Order) => void;
}

export const OrdersList = ({ orders, onOrderClick }: OrdersListProps) => {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-gray-400">
        <FileText className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-lg font-medium">No orders found for this period</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-bold">Order Number</th>
              <th className="px-6 py-4 font-bold">Time</th>
              <th className="px-6 py-4 font-bold">Customer</th>
              <th className="px-6 py-4 font-bold">Type</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold text-right">Amount</th>
              <th className="px-6 py-4 font-bold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50/50 transition-colors cursor-pointer group" onClick={() => onOrderClick(order)}>
                <td className="px-6 py-4 font-black text-gray-900">{order.orderNumber}</td>
                <td className="px-6 py-4 font-medium text-gray-500">{format(new Date(order.createdAt), 'hh:mm a')}</td>
                <td className="px-6 py-4">
                  <span className="font-bold text-gray-900 block">{order.customer?.name || '-'}</span>
                  <span className="text-xs text-gray-500">{order.customer?.phone || ''}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold uppercase tracking-wider">{order.orderType}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={clsx("px-2 py-1 rounded text-xs font-bold uppercase tracking-wider", 
                    order.status === 'COMPLETED' ? "bg-emerald-50 text-emerald-600" : 
                    order.status === 'CANCELLED' ? "bg-rose-50 text-rose-600" : 
                    "bg-amber-50 text-amber-600"
                  )}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-black text-gray-900 text-right">₹{order.grandTotal.toFixed(2)}</td>
                <td className="px-6 py-4 text-center">
                  <button className="p-2 text-gray-400 group-hover:text-amber-600 group-hover:bg-amber-50 rounded-lg transition-colors">
                    <Eye className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
