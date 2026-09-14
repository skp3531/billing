import React from 'react';
import { Order } from '../../../types';
import { ShoppingBag, CheckCircle2, XCircle, Clock } from 'lucide-react';
import clsx from 'clsx';

interface OrderDashboardKPIsProps {
  orders: Order[];
}

export const OrderDashboardKPIs = ({ orders }: OrderDashboardKPIsProps) => {
  const total = orders.length;
  const completed = orders.filter(o => o.status === 'COMPLETED').length;
  const cancelled = orders.filter(o => o.status === 'CANCELLED').length;
  const running = orders.filter(o => ['PENDING', 'PREPARING'].includes(o.status)).length;

  const kpis = [
    { title: 'Total Orders', value: total, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Completed', value: completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Running', value: running, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Cancelled', value: cancelled, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi, idx) => (
        <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className={clsx("p-3 rounded-xl", kpi.bg, kpi.color)}>
            <kpi.icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">{kpi.title}</p>
            <p className="text-2xl font-black text-gray-900">{kpi.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
