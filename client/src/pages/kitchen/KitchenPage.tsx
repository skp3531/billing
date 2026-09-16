import React, { useEffect, useState, useRef } from 'react';
import { orderApi } from '../../api/order.api';
import { Order, OrderItem } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';
import { Clock, ChefHat, CheckSquare, Square, Volume2, VolumeX, Flame } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

export default function KitchenPage() {
  const currentOutletId = useAuthStore(state => state.currentOutlet?._id);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [station, setStation] = useState<string>('ALL');
  
  // Audio state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const prevOrderCount = useRef(0);
  
  // Create an audio context / element for the notification ping
  const playPing = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      oscillator.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1); // A6
      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.error('Audio play failed', e);
    }
  };

  const fetchKOTs = async (silent = false) => {
    if (!currentOutletId) return;
    try {
      if (!silent) setLoading(true);
      const data = await orderApi.getOrders(currentOutletId, { filter: 'active', limit: 200 });
      // Only keep Pending & Preparing for KDS
      const kots = data.data.filter(o => ['PENDING', 'PREPARING'].includes(o.status));
      // Sort by oldest first (FIFO)
      kots.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      setOrders(kots);

      // Play sound if new orders arrived
      if (kots.length > prevOrderCount.current && prevOrderCount.current !== 0) {
        playPing();
      }
      prevOrderCount.current = kots.length;

    } catch (error: any) {
      if (!silent) toast.error('Failed to fetch KOTs');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchKOTs();
    const interval = setInterval(() => fetchKOTs(true), 10000);
    const clockInterval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => { clearInterval(interval); clearInterval(clockInterval); };
  }, [currentOutletId]);

  // Bump Bar Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space: Bump (Complete) the oldest PREPARING order
      if (e.code === 'Space') {
        e.preventDefault();
        const oldestPreparing = orders.find(o => o.status === 'PREPARING');
        if (oldestPreparing) handleCompleteOrder(oldestPreparing._id!);
      }
      // Enter: Start preparing the oldest PENDING order
      if (e.code === 'Enter') {
        e.preventDefault();
        const oldestPending = orders.find(o => o.status === 'PENDING');
        if (oldestPending) handleStartPreparing(oldestPending._id!);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [orders]);

  const handleStartPreparing = async (orderId: string) => {
    try {
      await orderApi.updateOrderStatus(orderId, 'PREPARING');
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'PREPARING' } : o));
    } catch (err) {
      toast.error('Failed to start preparing');
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      await orderApi.updateOrderStatus(orderId, 'COMPLETED');
      setOrders(prev => prev.filter(o => o._id !== orderId));
      toast.success('Order bumped!');
    } catch (err) {
      toast.error('Failed to complete order');
    }
  };

  const toggleItemStatus = async (orderId: string, itemId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PREPARED' ? 'PENDING' : 'PREPARED';
    try {
      await orderApi.updateOrderItemStatus(orderId, itemId, newStatus);
      setOrders(prev => prev.map(o => {
        if (o._id === orderId) {
          return {
            ...o,
            items: o.items.map(i => i._id === itemId ? { ...i, status: newStatus as any } : i)
          };
        }
        return o;
      }));
    } catch (err) {
      toast.error('Failed to update item');
    }
  };

  const getElapsedTime = (createdAt: string) => {
    const diff = currentTime - new Date(createdAt).getTime();
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const stations = ['ALL', 'MAIN', 'GRILL', 'BAR'];

  if (loading) return <div className="h-screen bg-gray-900 text-white flex items-center justify-center">Loading KDS...</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-950 font-sans text-gray-100 overflow-hidden select-none">
      
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-3 bg-gray-900 border-b border-gray-800 shrink-0 shadow-md">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-widest text-white">KDS PRO</h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Kitchen Display System</p>
          </div>
        </div>
        
        {/* Station Filter */}
        <div className="flex bg-gray-800 p-1 rounded-xl">
          {stations.map(st => (
            <button
              key={st}
              onClick={() => setStation(st)}
              className={clsx(
                "px-6 py-2 rounded-lg font-bold text-sm transition-all",
                station === st ? "bg-amber-500 text-gray-950 shadow-sm" : "text-gray-400 hover:text-white"
              )}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-gray-400 hover:text-white transition-colors">
            {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>
          <div className="text-2xl font-black tabular-nums tracking-wider text-amber-500">
            {format(currentTime, 'HH:mm:ss')}
          </div>
        </div>
      </div>

      {/* Ticket Grid */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex gap-4 h-full">
          {orders.map(order => {
            // Filter items by station
            const displayItems = station === 'ALL' 
              ? order.items 
              : order.items.filter(i => (i.station || 'MAIN') === station);

            // Skip rendering if no items for this station
            if (displayItems.length === 0) return null;

            const isPreparing = order.status === 'PREPARING';
            const elapsedMinutes = (currentTime - new Date(order.createdAt).getTime()) / 60000;
            const isDelayed = elapsedMinutes > 15;
            
            return (
              <div 
                key={order._id} 
                className={clsx(
                  "flex flex-col w-80 h-full rounded-2xl shadow-lg border-2 shrink-0 transition-colors overflow-hidden",
                  isDelayed ? "border-rose-500 bg-rose-950/20" : isPreparing ? "border-amber-500/50 bg-gray-900" : "border-gray-800 bg-gray-900"
                )}
              >
                {/* Ticket Header */}
                <div className={clsx("p-4 border-b border-gray-800", isDelayed ? "bg-rose-500/10" : "bg-gray-800/50")}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h2 className="text-2xl font-black text-white leading-none">#{order.orderNumber}</h2>
                      <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-wider">{order.orderType}</p>
                    </div>
                    <div className={clsx("px-3 py-1 rounded-lg text-xl font-black tabular-nums tracking-wider", isDelayed ? "bg-rose-500 text-white animate-pulse" : "bg-gray-800 text-amber-400")}>
                      {getElapsedTime(order.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Ticket Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {displayItems.map(item => (
                    <div 
                      key={item._id}
                      onClick={() => toggleItemStatus(order._id!, item._id!, item.status || 'PENDING')}
                      className={clsx(
                        "p-3 rounded-xl border cursor-pointer transition-all active:scale-[0.98]",
                        item.status === 'PREPARED' 
                          ? "bg-emerald-950/30 border-emerald-900/50 opacity-50" 
                          : "bg-gray-800 border-gray-700 hover:border-gray-600"
                      )}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <span className={clsx("font-black text-lg", item.status === 'PREPARED' ? 'text-emerald-500' : 'text-amber-500')}>
                          {item.quantity}x
                        </span>
                        <div className="flex-1">
                          <p className={clsx("font-bold text-lg leading-tight", item.status === 'PREPARED' ? 'text-gray-400 line-through' : 'text-gray-100')}>
                            {item.name}
                          </p>
                          {item.modifiers && item.modifiers.length > 0 && (
                            <p className="text-sm font-bold text-rose-400 mt-1">
                              + {item.modifiers.map(m => m.name).join(', ')}
                            </p>
                          )}
                          {item.notes && (
                            <p className="text-sm font-medium text-amber-200 mt-1 italic">
                              Note: {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Ticket Actions */}
                <div className="p-4 bg-gray-900 border-t border-gray-800 shrink-0">
                  {isPreparing ? (
                    <button 
                      onClick={() => handleCompleteOrder(order._id!)}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-black tracking-widest uppercase rounded-xl transition-colors shadow-lg active:scale-[0.98]"
                    >
                      Bump Order [Space]
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleStartPreparing(order._id!)}
                      className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-gray-950 text-lg font-black tracking-widest uppercase rounded-xl transition-colors shadow-lg active:scale-[0.98]"
                    >
                      Start [Enter]
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {orders.length === 0 && (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
              <ChefHat className="w-24 h-24 mb-6 opacity-20" />
              <p className="text-3xl font-black uppercase tracking-widest">No Active KOTs</p>
              <p className="text-lg font-bold mt-2">Kitchen is clear. Great job!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
