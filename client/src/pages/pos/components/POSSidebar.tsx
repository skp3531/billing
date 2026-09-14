import React from 'react';
import { ShoppingCart, Users, Tag, Clock, CreditCard, Coffee, Bookmark, ChefHat } from 'lucide-react';
import clsx from 'clsx';

interface POSSidebarProps {
  onAction: (action: string) => void;
  activeOrderType: string;
}

export const POSSidebar = ({ onAction, activeOrderType }: POSSidebarProps) => {
  const actions = [
    { id: 'new', label: 'New Sale', icon: ShoppingCart, hotkey: 'F2', color: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' },
    { id: 'customer', label: 'Customer', icon: Users, hotkey: 'F4', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    { id: 'discount', label: 'Discount', icon: Tag, hotkey: 'F6', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
    { id: 'hold', label: 'Hold Bill', icon: Bookmark, hotkey: 'F8', color: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
    { id: 'recall', label: 'Recall', icon: Clock, hotkey: 'F9', color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
    { id: 'payment', label: 'Checkout', icon: CreditCard, hotkey: 'F10', color: 'bg-rose-100 text-rose-700 hover:bg-rose-200' },
  ];

  return (
    <div className="w-20 bg-white border-r border-gray-200 flex flex-col shrink-0 py-4 gap-4 z-10 shadow-sm">
      {actions.map((act) => (
        <button
          key={act.id}
          onClick={() => onAction(act.id)}
          className="flex flex-col items-center justify-center gap-1 mx-2 p-2 rounded-xl transition-all active:scale-95 group relative"
          title={`${act.label} (${act.hotkey})`}
        >
          <div className={clsx("p-3 rounded-xl transition-colors", act.color)}>
            <act.icon className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-gray-600 tracking-tight text-center leading-tight">
            {act.label}
          </span>
          <span className="absolute -top-1 -right-1 bg-gray-800 text-white text-[8px] font-bold px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            {act.hotkey}
          </span>
        </button>
      ))}
      
      <div className="mt-auto px-2 space-y-2">
        <div className="text-[10px] font-bold text-gray-400 text-center uppercase mb-2">Order Type</div>
        {[
          { id: 'dine_in', label: 'Dine In', icon: Coffee },
          { id: 'takeaway', label: 'Takeaway', icon: ShoppingCart },
        ].map((type) => (
          <button
            key={type.id}
            onClick={() => onAction(`type_${type.id}`)}
            className={clsx(
              "w-full flex flex-col items-center p-2 rounded-lg border-2 transition-colors",
              activeOrderType === type.id 
                ? "border-amber-500 bg-amber-50 text-amber-700" 
                : "border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100"
            )}
          >
            <type.icon className="w-4 h-4 mb-1" />
            <span className="text-[9px] font-bold text-center leading-tight">{type.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
