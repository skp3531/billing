import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Activity, TrendingUp, TrendingDown, IndianRupee, ShoppingBag, Users, Utensils } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import api from '../../api/axios';

const dummySparkline = [
  { value: 10 }, { value: 25 }, { value: 15 }, { value: 40 }, 
  { value: 35 }, { value: 50 }, { value: 45 }
];

export default function DashboardView() {
  const { dateRange } = useOutletContext<any>();
  const [data, setData] = useState<any>(null);
  const [healthScore, setHealthScore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Pass dateRange to APIs if needed, currently fetching all time or simple match
      const [kpiRes, healthRes] = await Promise.all([
        api.get('/analytics/dashboard-kpis'),
        api.get('/analytics/health')
      ]);
      setData(kpiRes.data.data);
      setHealthScore(healthRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data || !healthScore) {
    return <div className="text-center p-12 font-bold text-gray-500 animate-pulse">Computing Intelligence...</div>;
  }

  const KPICard = ({ title, value, trend, growth, icon: Icon, colorClass, prefix = '' }: any) => {
    const isPositive = trend === 'up';
    return (
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${colorClass}`}>
              <Icon className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider">{title}</h3>
          </div>
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {growth}%
          </div>
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-black text-gray-900 tracking-tight">{prefix}{value.toLocaleString()}</p>
            <p className="text-xs font-bold text-gray-400 mt-1">vs Previous Period</p>
          </div>
          <div className="w-24 h-12 opacity-50 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dummySparkline}>
                <YAxis domain={['dataMin', 'dataMax']} hide />
                <Line type="monotone" dataKey="value" stroke={isPositive ? '#10B981' : '#F43F5E'} strokeWidth={2} dot={false} isAnimationActive={true} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">CEO Control Center</h1>
          <p className="text-gray-500 font-bold mt-1 text-sm">Real-time enterprise intelligence & operational health</p>
        </div>
        
        <div className="bg-[#0B1220] p-4 rounded-2xl flex items-center gap-6 shadow-xl border border-gray-800">
          <div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Business Health Score</p>
            <p className="text-3xl font-black text-white mt-1">{healthScore.score} <span className="text-sm text-gray-500">/ 100</span></p>
          </div>
          <div className="h-12 w-px bg-gray-800"></div>
          <div className="flex gap-4">
            <div>
              <p className="text-gray-500 text-[10px] font-bold uppercase">Growth</p>
              <p className="text-emerald-400 font-bold text-sm">+{healthScore.metrics.salesGrowth}%</p>
            </div>
            <div>
              <p className="text-gray-500 text-[10px] font-bold uppercase">Margin</p>
              <p className="text-amber-400 font-bold text-sm">{healthScore.metrics.profitMargin}%</p>
            </div>
            <div>
              <p className="text-gray-500 text-[10px] font-bold uppercase">Retention</p>
              <p className="text-blue-400 font-bold text-sm">{healthScore.metrics.customerRetention}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Gross Revenue" value={data.grossSales || 0} trend="up" growth="18.2" icon={IndianRupee} colorClass="bg-amber-100 text-amber-700" prefix="₹" />
        <KPICard title="Total Orders" value={data.ordersCount || 0} trend="up" growth="12.4" icon={ShoppingBag} colorClass="bg-indigo-100 text-indigo-700" />
        <KPICard title="Avg Order Value" value={Math.round((data.grossSales || 0) / (data.ordersCount || 1))} trend="down" growth="2.1" icon={Activity} colorClass="bg-blue-100 text-blue-700" prefix="₹" />
        <KPICard title="Food Cost %" value={28.4} trend="down" growth="1.2" icon={Utensils} colorClass="bg-emerald-100 text-emerald-700" prefix="" />
      </div>
      
      {/* Additional sections for Heatmaps and Charts would go here */}
      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
        <h3 className="font-black text-gray-900 mb-6">Revenue Forecast</h3>
        <div className="h-64 w-full flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-400 font-bold text-sm">Forecast Chart rendering in Sales Command Center...</p>
        </div>
      </div>

    </div>
  );
}
