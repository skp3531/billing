import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, ShoppingCart, Truck, CreditCard, ChevronRight, AlertTriangle, TrendingUp, CheckCircle, PackageSearch } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';
import PurchaseOrderModal from './PurchaseOrderModal';
import GRNModal from './GRNModal';

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [showPOModal, setShowPOModal] = useState(false);
  const [editingPO, setEditingPO] = useState(null);
  
  const [showGRNModal, setShowGRNModal] = useState(false);
  const [selectedGRN, setSelectedGRN] = useState(null);
  
  const [activeTab, setActiveTab] = useState('all'); // all, pending, received

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, purchasesRes] = await Promise.all([
        api.get('/purchases/analytics'),
        api.get('/purchases')
      ]);
      setAnalytics(analyticsRes.data.data);
      setPurchases(purchasesRes.data.data);
    } catch (err) {
      toast.error('Failed to load procurement data');
    } finally {
      setLoading(false);
    }
  };

  const KPICard = ({ title, value, subtitle, icon: Icon, colorClass }: any) => (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
      <div className={clsx("p-3 rounded-xl", colorClass)}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{title}</h3>
        <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
        <p className="text-xs font-bold text-gray-400 mt-1">{subtitle}</p>
      </div>
    </div>
  );

  const filteredPurchases = purchases.filter(p => {
    if (activeTab === 'pending') return ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ORDERED', 'PARTIALLY_RECEIVED'].includes(p.status);
    if (activeTab === 'received') return ['RECEIVED'].includes(p.status);
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-indigo-500" /> Procurement Center
          </h1>
          <p className="text-gray-500 font-bold mt-1">Manage purchase orders, goods receipts, and vendor payables</p>
        </div>
        <button onClick={() => { setEditingPO(null); setShowPOModal(true); }} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Create Purchase Order
        </button>
      </div>

      {loading ? (
        <div className="text-center p-12 text-gray-500 font-bold">Loading Procurement Engine...</div>
      ) : (
        <>
          {/* Dashboard KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard title="Monthly Purchases" value={`₹${(analytics?.kpis?.totalPurchasesMonth || 0).toLocaleString()}`} subtitle="Procurement cost this month" icon={TrendingUp} colorClass="bg-blue-50 text-blue-600" />
            <KPICard title="Outstanding Dues" value={`₹${(analytics?.kpis?.outstandingPayables || 0).toLocaleString()}`} subtitle={`Across ${analytics?.kpis?.supplierCount} suppliers`} icon={CreditCard} colorClass="bg-rose-50 text-rose-600" />
            <KPICard title="Pending POs" value={analytics?.kpis?.pendingOrders || 0} subtitle="Awaiting delivery/approval" icon={FileText} colorClass="bg-amber-50 text-amber-600" />
            <KPICard title="Expected Today" value={analytics?.kpis?.deliveriesExpectedToday || 0} subtitle="Deliveries arriving today" icon={Truck} colorClass="bg-emerald-50 text-emerald-600" />
          </div>

          {/* AI Insights & Reorder Automation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-1 lg:col-span-2 bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-2xl p-6 shadow-lg text-white">
              <h2 className="text-lg font-black flex items-center gap-2 mb-4"><PackageSearch className="w-5 h-5 text-indigo-300" /> AI Procurement Insights</h2>
              <div className="space-y-3">
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl flex items-start gap-3 border border-white/10">
                  <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0" />
                  <div>
                    <p className="font-bold text-sm">Milk purchase cost increased by 12% in the last 30 days.</p>
                    <p className="text-xs text-indigo-200 mt-1">Consider evaluating alternative suppliers for dairy.</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl flex items-start gap-3 border border-white/10">
                  <CheckCircle className="w-5 h-5 text-emerald-300 shrink-0" />
                  <div>
                    <p className="font-bold text-sm">Chocolate syrup consumption is tracking 18% higher than average.</p>
                    <p className="text-xs text-indigo-200 mt-1">Reorder threshold automatically adjusted.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-1 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-indigo-500" /> Suggested Reorders</h2>
              <div className="space-y-4">
                {analytics?.reorderSuggestions?.length > 0 ? (
                  analytics.reorderSuggestions.slice(0,3).map((item: any) => (
                    <div key={item.materialId} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                        <p className="text-xs font-bold text-rose-500">Stock: {item.currentStock} (Min: {item.minStockLevel})</p>
                      </div>
                      <button className="text-xs font-black bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-200">Order {item.suggestedQty}</button>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4 text-gray-400 font-bold text-sm">Inventory levels are optimal.</div>
                )}
              </div>
            </div>
          </div>

          {/* PO List */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-wrap justify-between items-center bg-gray-50/50 gap-4">
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button onClick={() => setActiveTab('all')} className={clsx("px-4 py-2 rounded-lg text-sm font-bold", activeTab === 'all' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500")}>All POs</button>
                <button onClick={() => setActiveTab('pending')} className={clsx("px-4 py-2 rounded-lg text-sm font-bold", activeTab === 'pending' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500")}>Pending / In-Transit</button>
                <button onClick={() => setActiveTab('received')} className={clsx("px-4 py-2 rounded-lg text-sm font-bold", activeTab === 'received' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500")}>Completed GRNs</button>
              </div>
              <div className="relative w-64">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search POs..." className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-bold">
                  <tr>
                    <th className="px-6 py-4">PO Number</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Supplier</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Payment</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPurchases.map((po: any) => (
                    <tr key={po._id} className="hover:bg-gray-50 group cursor-pointer" onClick={() => { setEditingPO(po); setShowPOModal(true); }}>
                      <td className="px-6 py-4 font-black text-indigo-600">{po.poNumber}</td>
                      <td className="px-6 py-4 font-bold text-gray-600">{new Date(po.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{po.supplierId?.name}</p>
                        {po.invoiceNumber && <p className="text-xs text-gray-400 font-bold mt-0.5">Inv: {po.invoiceNumber}</p>}
                      </td>
                      <td className="px-6 py-4 font-black text-gray-900">₹{(po.grandTotal || po.totalAmount).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={clsx(
                          "px-2 py-1 rounded-lg font-bold text-xs",
                          po.status === 'RECEIVED' ? 'bg-emerald-100 text-emerald-700' :
                          po.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700' :
                          ['ORDERED', 'PARTIALLY_RECEIVED'].includes(po.status) ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        )}>{po.status.replace('_', ' ')}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx(
                          "px-2 py-1 rounded-lg font-bold text-xs",
                          po.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                          po.paymentStatus === 'PARTIAL' ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                        )}>{po.paymentStatus}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {po.status !== 'RECEIVED' && po.status !== 'CANCELLED' ? (
                           <button onClick={(e) => { e.stopPropagation(); setSelectedGRN(po); setShowGRNModal(true); }} className="text-xs font-black bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100">
                             Process GRN
                           </button>
                        ) : (
                           <button className="text-gray-400 hover:text-indigo-600"><ChevronRight className="w-5 h-5 inline" /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPurchases.length === 0 && (
                <div className="text-center p-12 text-gray-400 font-bold">No purchase orders found matching this view.</div>
              )}
            </div>
          </div>
        </>
      )}

      {showPOModal && <PurchaseOrderModal po={editingPO} onClose={() => setShowPOModal(false)} onSave={fetchData} />}
      {showGRNModal && <GRNModal po={selectedGRN} onClose={() => setShowGRNModal(false)} onSave={fetchData} />}
    </div>
  );
}
