import React, { useState, useEffect } from 'react';
import { Plus, Search, DollarSign, TrendingUp, TrendingDown, PieChart, AlertTriangle, FileText, UploadCloud, ChevronRight, Calculator } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart as RePieChart, Pie } from 'recharts';
import ExpenseModal from './ExpenseModal';
import ApprovalsTab from './ApprovalsTab';
import BudgetsTab from './BudgetsTab';

export default function ExpensesPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [analytics, setAnalytics] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, expensesRes] = await Promise.all([
        api.get('/expenses/command-center'),
        api.get('/expenses')
      ]);
      setAnalytics(analyticsRes.data.data);
      setExpenses(expensesRes.data.data);
    } catch (err) {
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  const KPICard = ({ title, value, subtitle, icon: Icon, trend, colorClass }: any) => (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start justify-between">
      <div>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{title}</h3>
        <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
        <div className="flex items-center gap-2 mt-2">
          {trend !== undefined && (
            <span className={clsx("text-xs font-black flex items-center gap-1", trend > 0 ? "text-rose-500" : "text-emerald-500")}>
              {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(trend).toFixed(1)}%
            </span>
          )}
          <span className="text-xs font-bold text-gray-400">{subtitle}</span>
        </div>
      </div>
      <div className={clsx("p-3 rounded-xl", colorClass)}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );

  const COLORS = ['#4f46e5', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#f43f5e'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-rose-500" /> Financial Control Center
          </h1>
          <p className="text-gray-500 font-bold mt-1">Track, analyze, budget, and reduce restaurant expenses</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setEditingExpense(null); setShowModal(true); }} className="bg-rose-600 text-white px-5 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-rose-200 hover:bg-rose-700 flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> Log Expense
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-max">
        {['dashboard', 'ledger', 'approvals', 'budgets'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={clsx(
            "px-5 py-2 rounded-lg text-sm font-bold capitalize transition-all",
            activeTab === tab ? "bg-white text-rose-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
          )}>
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center p-12 text-gray-500 font-bold">Loading Financial Engine...</div>
      ) : (
        <>
          {activeTab === 'dashboard' && analytics && (
            <div className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Today's Spend" value={`₹${(analytics.kpis.todayTotal || 0).toLocaleString()}`} subtitle="Operating expenses" icon={DollarSign} colorClass="bg-blue-50 text-blue-600" />
                <KPICard title="This Month" value={`₹${(analytics.kpis.monthTotal || 0).toLocaleString()}`} subtitle="vs last month" trend={analytics.kpis.growthPercent} icon={PieChart} colorClass="bg-rose-50 text-rose-600" />
                <KPICard title="Net Profit (MTD)" value={`₹${(analytics.profitImpact.netProfit || 0).toLocaleString()}`} subtitle={`Margin: ${Math.max(0, 100 - analytics.profitImpact.expenseRatio).toFixed(1)}%`} icon={TrendingUp} colorClass="bg-emerald-50 text-emerald-600" />
                <KPICard title="Pending Approvals" value={analytics.kpis.pendingApprovals} subtitle="Awaiting manager sign-off" icon={FileText} colorClass="bg-amber-50 text-amber-600" />
              </div>

              {/* AI Insights & Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="col-span-1 lg:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-lg text-white">
                  <h2 className="text-lg font-black flex items-center gap-2 mb-4"><AlertTriangle className="w-5 h-5 text-rose-400" /> AI Business Insights</h2>
                  <div className="space-y-3">
                    {analytics.kpis.growthPercent > 10 && (
                      <div className="bg-rose-500/20 backdrop-blur-sm p-3 rounded-xl flex items-start gap-3 border border-rose-500/20">
                        <TrendingUp className="w-5 h-5 text-rose-400 shrink-0" />
                        <div>
                          <p className="font-bold text-sm">Expenses increased {analytics.kpis.growthPercent.toFixed(1)}% compared to last month.</p>
                          <p className="text-xs text-gray-400 mt-1">Review operational costs to prevent margin erosion.</p>
                        </div>
                      </div>
                    )}
                    {analytics.budgetVsActual?.filter((b:any) => b.percentUsed > 90).map((b:any, i:number) => (
                      <div key={i} className="bg-amber-500/20 backdrop-blur-sm p-3 rounded-xl flex items-start gap-3 border border-amber-500/20">
                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                        <div>
                          <p className="font-bold text-sm">{b.category} spend is at {b.percentUsed.toFixed(0)}% of budget.</p>
                          <p className="text-xs text-gray-400 mt-1">Remaining budget: ₹{b.variance.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                    <div className="bg-emerald-500/20 backdrop-blur-sm p-3 rounded-xl flex items-start gap-3 border border-emerald-500/20">
                      <TrendingDown className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <p className="font-bold text-sm">Potential savings of ₹7,500 identified.</p>
                        <p className="text-xs text-gray-400 mt-1">Packaging costs are higher than industry average. Consider negotiating with suppliers.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-1 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
                  <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Cost Efficiency Score</h2>
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="56" fill="none" stroke="#f3f4f6" strokeWidth="12" />
                      <circle cx="64" cy="64" r="56" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray="351.8" strokeDashoffset={351.8 - (351.8 * analytics.costEfficiencyScore) / 100} className="transition-all duration-1000 ease-out" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-gray-900">{analytics.costEfficiencyScore.toFixed(0)}</span>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-gray-400 mt-4">Based on budget compliance and cost leakage.</p>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trend Chart */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-black text-gray-900 mb-6">7-Day Expense Trend</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.trendData}>
                        <defs>
                          <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af', fontWeight: 'bold'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af', fontWeight: 'bold'}} tickFormatter={(v) => `₹${v}`} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Area type="monotone" dataKey="amount" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Categories Pie */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-black text-gray-900 mb-6">Category Breakdown</h3>
                  <div className="h-64 flex items-center">
                    <ResponsiveContainer width="50%" height="100%">
                      <RePieChart>
                        <Pie data={analytics.categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {analytics.categoryData.map((entry:any, index:number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      </RePieChart>
                    </ResponsiveContainer>
                    <div className="w-50% pl-4 space-y-3">
                      {analytics.categoryData.map((c:any, i:number) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                            <span className="font-bold text-gray-600">{c.name}</span>
                          </div>
                          <span className="font-black text-gray-900">₹{c.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Budget vs Actual */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-black text-gray-900 mb-6">Budget vs Actual Utilization</h3>
                <div className="space-y-6">
                  {analytics.budgetVsActual.map((b:any, idx:number) => (
                    <div key={idx}>
                      <div className="flex justify-between items-end mb-2">
                        <span className="font-bold text-gray-700">{b.category}</span>
                        <div className="text-right">
                          <span className={clsx("font-black text-sm", b.percentUsed > 100 ? "text-rose-600" : "text-gray-900")}>₹{b.actual.toLocaleString()}</span>
                          <span className="text-xs font-bold text-gray-400"> / ₹{b.budget.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className={clsx("h-full rounded-full transition-all duration-1000", b.percentUsed > 100 ? "bg-rose-500" : b.percentUsed > 80 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${Math.min(100, b.percentUsed)}%` }}></div>
                      </div>
                      {b.percentUsed > 100 && <p className="text-xs font-bold text-rose-500 mt-1 text-right">Over budget by ₹{Math.abs(b.variance).toLocaleString()}</p>}
                    </div>
                  ))}
                  {analytics.budgetVsActual.length === 0 && <p className="text-center text-gray-400 font-bold text-sm py-4">No budgets set. Go to Budgets tab to configure.</p>}
                </div>
              </div>

            </div>
          )}
          
          {activeTab === 'ledger' && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 font-bold">
                    <tr>
                      <th className="px-6 py-4">Exp ID / Date</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Vendor</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Mode</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {expenses.map((exp: any) => (
                      <tr key={exp._id} className="hover:bg-gray-50 group cursor-pointer" onClick={() => { setEditingExpense(exp); setShowModal(true); }}>
                        <td className="px-6 py-4">
                          <p className="font-black text-gray-900">{exp.expenseNumber || 'EXP-LEGACY'}</p>
                          <p className="text-xs font-bold text-gray-500">{new Date(exp.date).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-700">{exp.categoryString || exp.categoryId?.name || 'Uncategorized'}</td>
                        <td className="px-6 py-4 font-bold text-gray-900">{exp.vendorName || exp.supplierId?.name || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <span className={clsx("px-2 py-1 rounded-lg text-xs font-bold", exp.status === 'PAID' ? "bg-emerald-100 text-emerald-700" : exp.status === 'PENDING_APPROVAL' ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700")}>
                            {exp.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-500">{exp.paymentMode}</td>
                        <td className="px-6 py-4 text-right font-black text-gray-900">₹{(exp.totalAmount || exp.amount || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'approvals' && <ApprovalsTab expenses={expenses} onUpdate={fetchData} />}
          {activeTab === 'budgets' && <BudgetsTab onUpdate={fetchData} />}
        </>
      )}
      
      {showModal && <ExpenseModal expense={editingExpense} onClose={() => setShowModal(false)} onSave={fetchData} />}
    </div>
  );
}
