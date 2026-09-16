import React from 'react';
import { Order } from '../../../types';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Clock, CheckCircle2, User, Printer, Ban, Receipt, RefreshCcw, HandCoins } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { ActionModal } from './ActionModal';
import { useState } from 'react';

interface OrderDetailsDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onPrint: (o: Order) => void;
  onCancel: (o: Order) => void;
}

export const OrderDetailsDrawer = ({ order, isOpen, onClose, onPrint, onCancel }: OrderDetailsDrawerProps) => {
  const [modalType, setModalType] = useState<'REFUND' | 'VOID' | 'CANCEL' | null>(null);

  const handleActionSubmit = (reason: string, authBy: string) => {
    // In a real app, this would call the API
    console.log(`${modalType} submitted:`, { reason, authBy, orderId: order?._id });
    onCancel(order!); // Re-using onCancel for now as a generic action handler to show success
    setModalType(null);
    onClose();
  };
  if (!order) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={clsx("fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity", isOpen ? "opacity-100" : "opacity-0 pointer-events-none")} 
        onClick={onClose} 
      />
      
      {/* Drawer */}
      <div className={clsx(
        "fixed inset-y-0 right-0 w-full md:w-[480px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{order.orderNumber}</h2>
            <p className="text-xs font-medium text-gray-500 mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-900 shadow-sm transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Status & Priority */}
          <div className="flex items-center gap-3">
            <span className={clsx("px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider", 
              order.status === 'COMPLETED' ? "bg-emerald-100 text-emerald-700" : 
              order.status === 'CANCELLED' ? "bg-rose-100 text-rose-700" : 
              "bg-amber-100 text-amber-700"
            )}>
              {order.status}
            </span>
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700 uppercase tracking-wider">
              {order.orderType}
            </span>
            {order.priority === 'VIP' && (
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-700 uppercase tracking-wider">VIP</span>
            )}
          </div>

          {/* Customer */}
          {order.customer?.name && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="p-2 bg-white rounded-full shadow-sm"><User className="w-5 h-5 text-gray-400" /></div>
              <div>
                <p className="font-bold text-gray-900">{order.customer.name}</p>
                <p className="text-sm text-gray-500">{order.customer.phone || 'No phone provided'}</p>
              </div>
            </div>
          )}

          {/* Items */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3">Items Ordered</h3>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="flex gap-3">
                    <span className="font-bold text-gray-400">{item.quantity}x</span>
                    <div>
                      <p className="font-bold text-gray-900">{item.name}</p>
                      {item.modifiers && item.modifiers.length > 0 && (
                        <p className="text-xs text-gray-500">+ {item.modifiers.map(m => m.name).join(', ')}</p>
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">₹{(item.itemTotal || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
            <div className="flex justify-between text-sm font-medium text-gray-500">
              <span>Subtotal</span><span>₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-gray-500">
              <span>Taxes</span><span>₹{order.taxTotal.toFixed(2)}</span>
            </div>
            {order.discountTotal > 0 && (
              <div className="flex justify-between text-sm font-bold text-emerald-600">
                <span>Discount</span><span>-₹{order.discountTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-black text-gray-900 pt-2 border-t border-gray-200">
              <span>Total</span><span>₹{order.grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Timeline (mocked if not available) */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3">Timeline</h3>
            <div className="pl-4 border-l-2 border-gray-100 space-y-4">
              {order.timeline ? order.timeline.map((t, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[21px] p-1 bg-white border-2 border-amber-500 rounded-full"></div>
                  <p className="text-sm font-bold text-gray-900">{t.status}</p>
                  <p className="text-xs text-gray-500">{format(new Date(t.timestamp), 'hh:mm a')}</p>
                </div>
              )) : (
                <div className="relative">
                  <div className="absolute -left-[21px] p-1 bg-white border-2 border-emerald-500 rounded-full"></div>
                  <p className="text-sm font-bold text-gray-900">Order Placed</p>
                  <p className="text-xs text-gray-500">{format(new Date(order.createdAt), 'hh:mm a')}</p>
                </div>
              )}
            </div>
          </div>
          
        </div>

        {/* Actions Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 shrink-0">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button onClick={() => onPrint(order)} className="flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors text-sm">
              <Printer className="w-4 h-4" /> Print Bill
            </button>
            <button onClick={() => {}} className="flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors text-sm">
              <RefreshCcw className="w-4 h-4" /> Repeat Order
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {order.status !== 'CANCELLED' && (
              <button onClick={() => setModalType('CANCEL')} className="flex items-center justify-center gap-1.5 py-2 bg-white border border-rose-200 rounded-xl font-bold text-rose-600 hover:bg-rose-50 transition-colors text-xs">
                <Ban className="w-3 h-3" /> Cancel
              </button>
            )}
            {order.status === 'COMPLETED' && (
              <button onClick={() => setModalType('REFUND')} className="flex items-center justify-center gap-1.5 py-2 bg-white border border-amber-200 rounded-xl font-bold text-amber-600 hover:bg-amber-50 transition-colors text-xs">
                <HandCoins className="w-3 h-3" /> Refund
              </button>
            )}
            <button onClick={() => setModalType('VOID')} className="flex items-center justify-center gap-1.5 py-2 bg-white border border-purple-200 rounded-xl font-bold text-purple-600 hover:bg-purple-50 transition-colors text-xs">
               Void
            </button>
          </div>
        </div>
      </div>
      <ActionModal 
        isOpen={modalType !== null} 
        onClose={() => setModalType(null)} 
        title={modalType + ' Order'} 
        type={modalType!} 
        onSubmit={handleActionSubmit} 
      />
    </>
  );
};
