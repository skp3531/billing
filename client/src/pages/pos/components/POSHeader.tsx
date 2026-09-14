import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { Clock, Wifi, WifiOff, Store, User, Banknote, ShoppingBag } from 'lucide-react';

export const POSHeader = ({ 
  isOnline, 
  salesToday = 0, 
  ordersToday = 0 
}: { 
  isOnline: boolean; 
  salesToday?: number; 
  ordersToday?: number; 
}) => {
  const { currentOutlet, user } = useAuthStore();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-14 bg-gray-900 text-white px-4 flex items-center justify-between shrink-0 shadow-md z-10">
      
      {/* Left: Outlet & User */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-sm truncate max-w-[150px]">
            {currentOutlet?.name || 'No Outlet Selected'}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-300">
          <User className="w-4 h-4" />
          <span className="text-sm font-medium">{user?.name || 'Cashier'}</span>
          <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full ml-1 text-gray-300">Shift: Morning</span>
        </div>
      </div>

      {/* Center: Live Sales Widget */}
      <div className="hidden md:flex items-center gap-6 bg-gray-800 px-4 py-1.5 rounded-full border border-gray-700">
        <div className="flex items-center gap-2 text-emerald-400">
          <Banknote className="w-4 h-4" />
          <span className="text-sm font-bold">₹{salesToday.toFixed(2)}</span>
        </div>
        <div className="w-px h-4 bg-gray-600"></div>
        <div className="flex items-center gap-2 text-blue-400">
          <ShoppingBag className="w-4 h-4" />
          <span className="text-sm font-bold">{ordersToday} Orders</span>
        </div>
      </div>

      {/* Right: Time & Status */}
      <div className="flex items-center gap-6">
        <div className="text-sm font-medium text-gray-300 tracking-wider">
          {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        
        <div className="flex items-center gap-1.5">
          {isOnline ? (
            <div className="flex items-center gap-1.5 bg-emerald-900/50 text-emerald-400 px-2 py-1 rounded text-xs font-bold border border-emerald-800">
              <Wifi className="w-3.5 h-3.5" /> ONLINE
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-rose-900/50 text-rose-400 px-2 py-1 rounded text-xs font-bold border border-rose-800 animate-pulse">
              <WifiOff className="w-3.5 h-3.5" /> OFFLINE
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
