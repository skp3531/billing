import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { IndianRupee, ShoppingBag, Activity } from 'lucide-react';
import api from '../../api/axios';

export default function DashboardView() {
  const { dateRange } = useOutletContext<any>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const kpiRes = await api.get('/analytics/dashboard-kpis');
      setData(kpiRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <div className="text-center p-12 font-bold text-gray-500 animate-pulse">Loading Sales Data...</div>;
  }

  const KPICard = ({ title, value, icon: Icon, colorClass, prefix = '' }: any) => {
    return (
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{title}</h3>
          <p className="text-3xl font-black text-gray-900 mt-1">{prefix}{value.toLocaleString()}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Daily Sales</h1>
        <p className="text-gray-500 font-bold mt-1 text-sm">Overview of revenue and order volume</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard title="Gross Revenue" value={data.grossSales || 0} icon={IndianRupee} colorClass="bg-indigo-50 text-indigo-600" prefix="₹" />
        <KPICard title="Total Orders" value={data.ordersCount || 0} icon={ShoppingBag} colorClass="bg-blue-50 text-blue-600" />
        <KPICard title="Avg Order Value" value={Math.round((data.grossSales || 0) / (data.ordersCount || 1))} icon={Activity} colorClass="bg-emerald-50 text-emerald-600" prefix="₹" />
      </div>
      
      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
        <h3 className="font-black text-gray-900 mb-6">Sales by Category</h3>
        <div className="h-64 w-full flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-400 font-bold text-sm">Basic Bar Chart Placeholder</p>
        </div>
      </div>
    </div>
  );
}
