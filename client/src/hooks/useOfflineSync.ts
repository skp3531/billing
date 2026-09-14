import { useEffect, useState } from 'react';
import { db } from '../utils/db';
import { orderApi } from '../api/order.api';
import { toast } from 'react-hot-toast';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online. Syncing offline orders...');
      syncOrders();
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error('You are offline. Orders will be queued.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncOrders = async () => {
    if (isSyncing || !navigator.onLine) return;
    setIsSyncing(true);
    
    try {
      const queuedOrders = await db.offlineOrders.where('status').equals('queued').toArray();
      if (queuedOrders.length === 0) {
        setIsSyncing(false);
        return;
      }

      for (const order of queuedOrders) {
        try {
          await orderApi.createOrder(order.payload);
          await db.offlineOrders.update(order.id!, { status: 'synced' });
        } catch (err: any) {
          console.error('Failed to sync order', err);
          // Only mark as failed if it's a 4xx error (validation), network errors should retry later
          if (err.response && err.response.status >= 400 && err.response.status < 500) {
             await db.offlineOrders.update(order.id!, { status: 'failed' });
          }
        }
      }
      
      const remaining = await db.offlineOrders.where('status').equals('queued').count();
      if (remaining === 0) {
        toast.success('All offline orders synced successfully');
      }
    } catch (err) {
      console.error('Sync process error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Run sync periodically just in case
  useEffect(() => {
    const interval = setInterval(syncOrders, 30000);
    return () => clearInterval(interval);
  }, [isSyncing]);

  return { isOnline, isSyncing, syncOrders };
};
