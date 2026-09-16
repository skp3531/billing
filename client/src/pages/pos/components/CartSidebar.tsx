import React from 'react';
import { MenuItem, MenuVariant, OrderItemModifier, OrderType, PaymentMethod } from '../../../types';
import { Trash2, Plus, Minus, FileText, ChevronRight, User } from 'lucide-react';
import clsx from 'clsx';

interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  variant?: MenuVariant;
  modifiers: OrderItemModifier[];
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
}

interface CartSidebarProps {
  cart: CartItem[];
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  onCheckout: () => void;
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  loyaltyPointsUsed?: number;
  setLoyaltyPointsUsed?: (pts: number) => void;
  customer: any;
  onOpenCustomerModal: () => void;
}

export const CartSidebar = ({
  cart, updateQuantity, removeItem, onCheckout, 
  subtotal, taxTotal, grandTotal, customer, loyaltyPointsUsed = 0, setLoyaltyPointsUsed, onOpenCustomerModal
}: CartSidebarProps) => {

  return (
    <div className="w-[380px] bg-white border-l border-gray-200 flex flex-col h-full shrink-0 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-20">
      
      {/* Cart Header (Customer) */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors" onClick={onOpenCustomerModal}>
        <div className="flex items-center gap-3 text-gray-700">
          <div className="p-2 bg-gray-200 rounded-full">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Customer</p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-gray-900">{customer?.name || 'Walk-in Customer'}</p>
              {customer?.tier && <span className="text-[9px] uppercase font-black bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">{customer.tier}</span>}
            </div>
            {customer && (
              <div className="mt-1">
                <p className="text-xs font-bold text-amber-600">{customer.loyaltyPoints || 0} pts available</p>
                {setLoyaltyPointsUsed && customer.loyaltyPoints > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <input 
                      type="number" 
                      max={customer.loyaltyPoints} 
                      min="0"
                      value={loyaltyPointsUsed || ''} 
                      onChange={e => setLoyaltyPointsUsed(Math.min(customer.loyaltyPoints, Number(e.target.value)))}
                      className="w-16 px-2 py-1 text-xs border rounded outline-none"
                      placeholder="Use pts"
                    />
                    <span className="text-[10px] text-gray-400">Redeem</span>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto bg-white p-2">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <ShoppingCartIcon className="w-16 h-16 mb-4 opacity-20" />
            <p className="font-medium">Cart is empty</p>
          </div>
        ) : (
          <div className="space-y-2">
            {cart.map((item) => (
              <div key={item.cartItemId} className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm group">
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-2">
                    <h4 className="font-bold text-gray-900 text-sm leading-tight">
                      {item.menuItem.name} {item.variant ? `(${item.variant.name})` : ''}
                    </h4>
                    {item.modifiers.length > 0 && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        + {item.modifiers.map(m => m.name).join(', ')}
                      </p>
                    )}
                    <p className="text-sm font-bold text-amber-600 mt-1">₹{item.unitPrice}</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                      <button onClick={() => updateQuantity(item.cartItemId, -1)} className="p-1.5 text-gray-600 hover:bg-gray-200 hover:text-rose-600 transition-colors">
                        {item.quantity === 1 ? <Trash2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartItemId, 1)} className="p-1.5 text-gray-600 hover:bg-gray-200 hover:text-emerald-600 transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="font-bold text-gray-900 text-sm">₹{item.subtotal}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Totals & Checkout */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 shrink-0">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm font-medium text-gray-500">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium text-gray-500">
            <span>Taxes</span>
            <span>₹{taxTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium text-gray-500">
            <span>Points Discount</span>
            <span className="text-emerald-600">-₹{loyaltyPointsUsed.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-black text-gray-900 pt-2 border-t border-gray-200">
            <span>Total</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={onCheckout}
          disabled={cart.length === 0}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
        >
          <FileText className="w-6 h-6" />
          Checkout <span className="text-sm opacity-80">(F10)</span>
        </button>
      </div>
    </div>
  );
};

// Placeholder icon since ShoppingCart is not imported from lucide-react in this exact file if I missed it
const ShoppingCartIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
);
