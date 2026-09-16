import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, PieChart, IndianRupee, ShoppingBag, ArrowUpRight, ArrowDownRight, Calendar, Download, RefreshCw, Layers } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell, PieChart as RechartsPieChart, Pie } from 'recharts';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState('month'); // today, week, month, year
  
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [salesData, setSalesData] = useState<any>(null);
  const [productData, setProductData] = useState<any>(null);
  const [plData, setPlData] = useState<any>(null);
  const [gstData, setGstData] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, [dateRange]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const params = { range: dateRange };
      const [dashRes, salesRes, prodRes, plRes, gstRes] = await Promise.all([
        api.get('/analytics/dashboard-kpis', { params }),
        api.get('/analytics/sales', { params }),
        api.get('/analytics/products', { params }),
        api.get('/analytics/profit-and-loss', { params }),
        api.get('/analytics/gst-report', { params })
      ]);
      
      setDashboardData(dashRes.data);
      setSalesData(salesRes.data);
      setProductData(prodRes.data);
      setPlData(plRes.data);
      setGstData(gstRes.data);
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const KPICard = ({ title, value, previous, prefix = '', suffix = '' }: any) => {
    const isPositive = previous === null || value >= previous;
    const diff = previous ? Math.abs(((value - previous) / previous) * 100).toFixed(1) : '0.0';
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{title}</p>
        <div className="mt-2 flex items-end gap-4">
          <h3 className="text-3xl font-black text-gray-900">{prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}{suffix}</h3>
          {previous !== null && (
            <div className={clsx("flex items-center gap-1 text-sm font-bold mb-1", isPositive ? "text-emerald-600" : "text-rose-600")}>
              {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {diff}% vs last
            </div>
          )}
        </div>
      </div>
    );
  };

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2"><BarChart3 className="w-6 h-6 text-indigo-600" /> Analytics</h2>
        </div>
        <div className="p-4 space-y-2 flex-1">
          <SidebarBtn icon={TrendingUp} label="Business Overview" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarBtn icon={PieChart} label="Item Profitability" active={activeTab === 'products'} onClick={() => setActiveTab('products')} />
          <SidebarBtn icon={Layers} label="P&L Statement" active={activeTab === 'pl'} onClick={() => setActiveTab('pl')} />
          <SidebarBtn icon={IndianRupee} label="Tax & GST Report" active={activeTab === 'gst'} onClick={() => setActiveTab('gst')} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        
        {/* Header Bar */}
        <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              {activeTab === 'dashboard' && 'Business Overview'}
              {activeTab === 'products' && 'Menu Engineering & Product Mix'}
              {activeTab === 'pl' && 'Profit & Loss Statement'}
              {activeTab === 'gst' && 'GST Liability Report'}
            </h1>
            <p className="text-gray-500 font-bold mt-1 text-sm">Real-time enterprise intelligence</p>
          </div>
          
          <div className="flex items-center gap-4">
            <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="bg-gray-100 border-none font-bold text-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <button onClick={fetchAllData} className="p-2 text-gray-500 hover:text-indigo-600 bg-gray-100 hover:bg-indigo-50 rounded-xl transition-colors"><RefreshCw className={clsx("w-5 h-5", loading && "animate-spin")} /></button>
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 shadow-md"><Download className="w-4 h-4"/> Export</button>
          </div>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="h-64 flex items-center justify-center font-bold text-gray-400">Loading Intelligence...</div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-8">
              
              {/* DASHBOARD TAB */}
              {activeTab === 'dashboard' && dashboardData && salesData && (
                <>
                  {/* KPIs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KPICard title="Net Sales" prefix="₹" value={dashboardData.current?.netSales} previous={dashboardData.previous?.netSales} />
                    <KPICard title="Total Orders" value={dashboardData.current?.ordersCount} previous={dashboardData.previous?.ordersCount} />
                    <KPICard title="Average Order Value" prefix="₹" value={Math.round(dashboardData.current?.averageOrderValue)} previous={Math.round(dashboardData.previous?.averageOrderValue || 0)} />
                    <KPICard title="Guest Count" value={dashboardData.current?.uniqueCustomers} previous={dashboardData.previous?.uniqueCustomers} />
                  </div>

                  {/* Revenue Chart */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="font-black text-gray-900 mb-6">Revenue Trend</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={salesData.dailyTrend}>
                          <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(value) => `₹${value}`} />
                          <RechartsTooltip cursor={{stroke: '#cbd5e1'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                          <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                      <h3 className="font-black text-gray-900 mb-6">Order Types</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={salesData.orderTypeBreakdown}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                            <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px'}} />
                            <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                      <h3 className="font-black text-gray-900 mb-6">Peak Trading Hours</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={salesData.peakHours}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(val) => `${val}:00`} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                            <RechartsTooltip cursor={{stroke: '#cbd5e1'}} contentStyle={{borderRadius: '12px'}} labelFormatter={(val) => `${val}:00 Hour`} />
                            <Area type="monotone" dataKey="orders" stroke="#f59e0b" strokeWidth={3} fillOpacity={0.2} fill="#fcd34d" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* PRODUCTS TAB */}
              {activeTab === 'products' && productData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden lg:col-span-2">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-black text-gray-900">Top 10 Selling Items</h3>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Item Name</th>
                          <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Quantity Sold</th>
                          <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {productData.topItems?.map((item: any) => (
                          <tr key={item._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{item.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-indigo-600">₹{item.revenue.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="font-black text-gray-900 mb-6">Category Sales Mix</h3>
                    <div className="h-64 flex justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie data={productData.categoryBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="revenue" nameKey="name" label>
                            {productData.categoryBreakdown.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* P&L TAB */}
              {activeTab === 'pl' && plData && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-gray-900">Profit & Loss Statement</h2>
                    <p className="text-gray-500 font-bold">For selected period</p>
                  </div>

                  <div className="space-y-4">
                    {/* Revenue */}
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="font-bold text-gray-700">Gross Sales</span>
                      <span className="font-black text-gray-900">₹{plData.grossSales?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100 pl-6">
                      <span className="font-bold text-gray-500">Less: Taxes Collected</span>
                      <span className="font-bold text-rose-500">- ₹{plData.taxes?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b-2 border-gray-900 bg-gray-50 px-4 rounded-lg">
                      <span className="font-black text-indigo-900">Net Revenue</span>
                      <span className="font-black text-indigo-900 text-lg">₹{plData.revenue?.toLocaleString() || 0}</span>
                    </div>

                    {/* COGS */}
                    <div className="flex justify-between items-center py-3 border-b border-gray-100 mt-6">
                      <span className="font-bold text-gray-700">Cost of Goods Sold (Purchases)</span>
                      <span className="font-bold text-rose-500">- ₹{plData.purchases?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b-2 border-gray-200 bg-indigo-50/50 px-4 rounded-lg">
                      <span className="font-black text-gray-900">Gross Profit</span>
                      <span className="font-black text-gray-900 text-lg">₹{plData.grossProfit?.toLocaleString() || 0}</span>
                    </div>

                    {/* OPEX */}
                    <div className="flex justify-between items-center py-3 border-b border-gray-100 mt-6">
                      <span className="font-bold text-gray-700">Operating Expenses</span>
                      <span className="font-bold text-rose-500">- ₹{plData.expenses?.toLocaleString() || 0}</span>
                    </div>

                    {/* Net Profit */}
                    <div className="flex justify-between items-center py-6 mt-6 border-t-4 border-emerald-500 bg-emerald-50 px-6 rounded-xl">
                      <span className="font-black text-emerald-900 text-xl">Net Profit</span>
                      <span className="font-black text-emerald-700 text-2xl">₹{plData.netProfit?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* GST TAB */}
              {activeTab === 'gst' && gstData && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                      <h3 className="font-black text-gray-900">HSN-wise GST Liability</h3>
                      <p className="text-sm font-bold text-gray-500 mt-1">Ready for GSTR-1 filing</p>
                    </div>
                  </div>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">HSN Code</th>
                        <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase">Taxable Value</th>
                        <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase">CGST</th>
                        <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase">SGST</th>
                        <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase">Total Tax</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {gstData.map((row: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{row.hsnCode}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">₹{row.revenue.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">₹{row.cgst.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">₹{row.sgst.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-gray-900 text-right">₹{row.totalTax.toLocaleString()}</td>
                        </tr>
                      ))}
                      {gstData.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-bold">No taxable sales in this period.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const SidebarBtn = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={clsx(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
      active 
        ? "bg-indigo-50 text-indigo-700 shadow-sm" 
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    )}
  >
    <Icon className="w-5 h-5 shrink-0" />
    {label}
  </button>
);
