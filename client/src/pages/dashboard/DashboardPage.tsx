import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';
import { format } from 'date-fns';
import { 
  TrendingUp, TrendingDown, IndianRupee, ShoppingBag, Users, Clock, Receipt, AlertCircle, RefreshCw, BarChart2, DollarSign, Store, Activity, LayoutGrid
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { user, currentOutlet } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('today');

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/analytics/command-center?filter=${filter}&outletId=${currentOutlet?._id || ''}`);
      setData(res.data.data);
    } catch (err) {
      toast.error('Failed to load Command Center data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter, currentOutlet]);

  const KPICard = ({ title, value, prefix = '', suffix = '', growth, prev, icon: Icon, colorClass }: any) => {
    const isPositive = growth > 0;
    const isNegative = growth < 0;
    
    return (
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div className={clsx("p-2 rounded-lg", colorClass)}>
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{title}</h3>
          </div>
        </div>
        <div className="mb-2">
          <span className="text-3xl font-black text-gray-900">{prefix}{value}{suffix}</span>
        </div>
        <div className="flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-1">
            {isPositive && <span className="text-emerald-600 flex items-center bg-emerald-50 px-2 py-0.5 rounded-full"><TrendingUp className="w-3 h-3 mr-1" /> {growth}%</span>}
            {isNegative && <span className="text-rose-600 flex items-center bg-rose-50 px-2 py-0.5 rounded-full"><TrendingDown className="w-3 h-3 mr-1" /> {Math.abs(growth)}%</span>}
            {growth === 0 && <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">0%</span>}
            <span className="text-gray-400 ml-1">vs prev</span>
          </div>
          <span className="text-gray-400">Prev: {prefix}{prev}{suffix}</span>
        </div>
      </div>
    );
  };

  if (loading && !data) {
    return <div className="p-8 text-center text-gray-500 font-bold">Loading Command Center...</div>;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f8fafc] p-6 space-y-6">
      
      {/* 1. EXECUTIVE OVERVIEW HEADER */}
      <div className="bg-gray-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="z-10 flex items-center gap-6">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
            <Store className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black">{currentOutlet?.name || 'Main Outlet'}</h1>
            <p className="text-gray-300 font-bold flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4" /> {format(currentTime, 'EEEE, dd MMMM yyyy • hh:mm a')}
            </p>
          </div>
        </div>
        <div className="z-10 flex gap-4 text-sm font-bold bg-white/10 p-3 rounded-2xl border border-white/20">
          <div className="px-4 py-2 border-r border-white/20">
            <p className="text-gray-400 text-xs uppercase mb-1">Cashier</p>
            <p>{user?.name}</p>
          </div>
          <div className="px-4 py-2 border-r border-white/20">
            <p className="text-gray-400 text-xs uppercase mb-1">Business</p>
            <p className="flex items-center gap-2 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Open</p>
          </div>
          <div className="px-4 py-2">
            <p className="text-gray-400 text-xs uppercase mb-1">Health Score</p>
            <p className={clsx(
              data?.health?.score >= 80 ? 'text-emerald-400' : data?.health?.score >= 60 ? 'text-amber-400' : 'text-rose-400'
            )}>{data?.health?.score} / 100</p>
          </div>
        </div>
      </div>

      {/* 2. SMART DATE FILTERS */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'last7days', label: 'Last 7 Days' },
            { id: 'last30days', label: 'Last 30 Days' },
            { id: 'thisMonth', label: 'This Month' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                filter === f.id ? "bg-gray-900 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button onClick={fetchData} className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 shadow-sm"><RefreshCw className="w-5 h-5" /></button>
      </div>

      {/* 3. EXECUTIVE KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Net Sales" value={data?.kpis?.netSales?.value.toLocaleString()} prev={data?.kpis?.netSales?.prev.toLocaleString()} growth={data?.kpis?.netSales?.growth} prefix="₹" icon={IndianRupee} colorClass="bg-indigo-50 text-indigo-600" />
        <KPICard title="Total Orders" value={data?.kpis?.orders?.value} prev={data?.kpis?.orders?.prev} growth={data?.kpis?.orders?.growth} icon={ShoppingBag} colorClass="bg-emerald-50 text-emerald-600" />
        <KPICard title="Avg Order Value" value={data?.kpis?.aov?.value.toLocaleString(undefined, {maximumFractionDigits:0})} prev={data?.kpis?.aov?.prev.toLocaleString(undefined, {maximumFractionDigits:0})} growth={data?.kpis?.aov?.growth} prefix="₹" icon={Receipt} colorClass="bg-amber-50 text-amber-600" />
        <KPICard title="Net Profit (Est)" value={data?.kpis?.profit?.value.toLocaleString()} prev={data?.kpis?.profit?.prev.toLocaleString()} growth={data?.kpis?.profit?.growth} prefix="₹" icon={DollarSign} colorClass="bg-rose-50 text-rose-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 6. LIVE ORDER MONITOR & TABLES */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-indigo-500" /> Live Operations Monitor</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <p className="text-xs font-bold text-amber-700 uppercase mb-1">Running Orders</p>
                <p className="text-3xl font-black text-amber-900">{data?.orderMonitor?.running}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <p className="text-xs font-bold text-emerald-700 uppercase mb-1">Completed</p>
                <p className="text-3xl font-black text-emerald-900">{data?.orderMonitor?.completed}</p>
              </div>
            </div>
            
            <div className="mt-6 border-t border-gray-100 pt-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Table Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="flex items-center gap-2 text-rose-600"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Occupied</span>
                  <span className="text-gray-900">{data?.tableSummary?.occupied} / {data?.tableSummary?.total}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="flex items-center gap-2 text-emerald-600"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Available</span>
                  <span className="text-gray-900">{data?.tableSummary?.available} / {data?.tableSummary?.total}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="flex items-center gap-2 text-amber-600"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Reserved</span>
                  <span className="text-gray-900">{data?.tableSummary?.reserved}</span>
                </div>
              </div>
              <Link to="/tables" className="mt-4 block text-center w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-2 rounded-xl transition-colors text-sm border border-gray-200">View Floor Plan</Link>
            </div>
          </div>
          
          {/* QUICK ACTION CENTER */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2"><LayoutGrid className="w-5 h-5 text-indigo-500" /> Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/pos" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 p-3 rounded-xl font-bold text-center text-sm transition-colors border border-indigo-100">Open POS</Link>
              <Link to="/kitchen" className="bg-rose-50 text-rose-700 hover:bg-rose-100 p-3 rounded-xl font-bold text-center text-sm transition-colors border border-rose-100">Kitchen Display</Link>
              <Link to="/reservations" className="bg-amber-50 text-amber-700 hover:bg-amber-100 p-3 rounded-xl font-bold text-center text-sm transition-colors border border-amber-100">New Booking</Link>
              <Link to="/inventory" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 p-3 rounded-xl font-bold text-center text-sm transition-colors border border-emerald-100">Stock Check</Link>
            </div>
          </div>
        </div>

        {/* TOP ITEMS & AI INSIGHTS */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
               <h2 className="text-lg font-black text-gray-900 mb-4">Top Selling Items</h2>
               <div className="space-y-4">
                 {data?.topItems?.slice(0,5).map((item: any, i: number) => (
                   <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0">
                     <div>
                       <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                       <p className="text-xs text-gray-500 font-bold">{item.qty} units sold</p>
                     </div>
                     <span className="font-black text-indigo-600">₹{item.revenue.toLocaleString()}</span>
                   </div>
                 ))}
                 {data?.topItems?.length === 0 && <p className="text-sm text-gray-500 italic">No sales data for this period.</p>}
               </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col">
               <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-indigo-500" /> AI Business Insights</h2>
               <div className="flex-1 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-100 space-y-4">
                 {data?.insights?.map((insight: string, i: number) => (
                   <div key={i} className="flex gap-3">
                     <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5"></span>
                     <p className="text-sm font-bold text-indigo-900 leading-snug">{insight}</p>
                   </div>
                 ))}
                 {(!data?.insights || data?.insights.length === 0) && (
                   <p className="text-sm font-bold text-indigo-500/70 italic text-center mt-10">AI analyzing patterns...</p>
                 )}
               </div>
            </div>
          </div>
          
          {/* PROFITABILITY WIDGET & PAYMENT MODES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
               <h2 className="text-lg font-black text-white mb-4 relative z-10">Profitability (Est)</h2>
               <div className="space-y-4 relative z-10">
                 <div className="flex justify-between items-center text-sm font-bold">
                   <span className="text-gray-400">Gross Revenue</span>
                   <span>₹{data?.kpis?.grossSales?.value.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm font-bold">
                   <span className="text-gray-400">Expenses Logged</span>
                   <span className="text-rose-400">- ₹{data?.kpis?.expenses?.value.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm font-bold">
                   <span className="text-gray-400">Discounts</span>
                   <span className="text-rose-400">- ₹{data?.kpis?.discounts?.value.toLocaleString()}</span>
                 </div>
                 <div className="border-t border-white/20 pt-4 flex justify-between items-center">
                   <span className="font-black text-emerald-400">Net Profit</span>
                   <span className="text-2xl font-black text-emerald-400">₹{data?.kpis?.profit?.value.toLocaleString()}</span>
                 </div>
               </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
               <h2 className="text-lg font-black text-gray-900 mb-4">Payment Methods</h2>
               <div className="space-y-4">
                 {Object.entries(data?.paymentMethods || {}).map(([method, amount]: any) => (
                   <div key={method}>
                     <div className="flex justify-between items-center mb-1">
                       <span className="text-sm font-bold text-gray-700 uppercase">{method}</span>
                       <span className="text-sm font-black text-gray-900">₹{amount.toLocaleString()}</span>
                     </div>
                     <div className="w-full bg-gray-100 rounded-full h-2">
                       <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.min((amount / data?.kpis?.grossSales?.value) * 100, 100)}%` }}></div>
                     </div>
                   </div>
                 ))}
                 {Object.keys(data?.paymentMethods || {}).length === 0 && <p className="text-sm text-gray-500 italic">No payments received.</p>}
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
