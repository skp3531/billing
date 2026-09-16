import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, BookOpen, LayoutGrid, Star, QrCode, Tag, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';
import MenuItemForm from './MenuItemForm';

export default function MenuPage() {
  const { currentOutlet } = useAuthStore();
  const [activeTab, setActiveTab] = useState('engineering'); // 'items', 'categories', 'engineering', 'qrmenu'
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [engineeringData, setEngineeringData] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, [currentOutlet]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [engRes, catRes] = await Promise.all([
        api.get('/menu-items/engineering'),
        api.get('/categories')
      ]);
      setEngineeringData(engRes.data.data);
      setMenuItems(engRes.data.data.analyzedItems);
      setCategories(catRes.data.data);
    } catch (err) {
      toast.error('Failed to load Menu Engineering data');
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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-500" /> Menu Engineering
          </h1>
          <p className="text-gray-500 font-bold mt-1">Manage products, pricing, and profitability</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button onClick={() => setActiveTab('engineering')} className={clsx("px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2", activeTab === 'engineering' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500")}>
            <TrendingUp className="w-4 h-4" /> Matrix
          </button>
          <button onClick={() => setActiveTab('items')} className={clsx("px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2", activeTab === 'items' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500")}>
            <BookOpen className="w-4 h-4" /> Items
          </button>
          <button onClick={() => setActiveTab('categories')} className={clsx("px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2", activeTab === 'categories' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500")}>
            <LayoutGrid className="w-4 h-4" /> Categories
          </button>
          <button onClick={() => setActiveTab('qrmenu')} className={clsx("px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2", activeTab === 'qrmenu' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500")}>
            <QrCode className="w-4 h-4" /> QR Menu
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-12 text-gray-500 font-bold">Loading Menu Engine...</div>
      ) : (
        <>
          {activeTab === 'engineering' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KPICard title="Total Items" value={engineeringData?.kpis?.totalItems} subtitle={`${engineeringData?.kpis?.activeItems} Active`} icon={BookOpen} colorClass="bg-indigo-50 text-indigo-600" />
                <KPICard title="Out of Stock" value={engineeringData?.kpis?.outOfStock} subtitle="Needs inventory update" icon={AlertTriangle} colorClass="bg-rose-50 text-rose-600" />
                <KPICard title="Avg Food Cost" value={`${engineeringData?.kpis?.avgCostPct?.toFixed(1)}%`} subtitle="Theoretical cost" icon={Tag} colorClass="bg-amber-50 text-amber-600" />
                <KPICard title="Avg Gross Margin" value={`${engineeringData?.kpis?.avgMargin?.toFixed(1)}%`} subtitle="Overall profitability" icon={TrendingUp} colorClass="bg-emerald-50 text-emerald-600" />
              </div>

              {/* BCG MATRIX */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* STARS */}
                <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><Star className="w-24 h-24 text-emerald-500" /></div>
                  <h3 className="text-lg font-black text-emerald-700 mb-2">Stars (High Sales, High Profit)</h3>
                  <p className="text-sm font-bold text-gray-500 mb-4">Promote heavily. Highly profitable and popular.</p>
                  <div className="space-y-3 relative z-10">
                    {engineeringData?.matrix?.stars?.map((item: any) => (
                      <div key={item._id} className="flex justify-between items-center bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                        <div>
                          <p className="font-bold text-gray-900">{item.name}</p>
                          <p className="text-xs font-bold text-gray-500">{item.qtySold} sold • {item.calculatedMargin.toFixed(1)}% margin</p>
                        </div>
                        <span className="font-black text-emerald-600">₹{item.basePrice}</span>
                      </div>
                    ))}
                    {engineeringData?.matrix?.stars?.length === 0 && <p className="text-sm text-gray-400 font-bold italic">No items match this criteria.</p>}
                  </div>
                </div>

                {/* CASH COWS */}
                <div className="bg-white rounded-2xl p-6 border border-indigo-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp className="w-24 h-24 text-indigo-500" /></div>
                  <h3 className="text-lg font-black text-indigo-700 mb-2">Cash Cows (Low Sales, High Profit)</h3>
                  <p className="text-sm font-bold text-gray-500 mb-4">Highly profitable but lower volume. Needs marketing push.</p>
                  <div className="space-y-3 relative z-10">
                    {engineeringData?.matrix?.cashCows?.map((item: any) => (
                      <div key={item._id} className="flex justify-between items-center bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                        <div>
                          <p className="font-bold text-gray-900">{item.name}</p>
                          <p className="text-xs font-bold text-gray-500">{item.qtySold} sold • {item.calculatedMargin.toFixed(1)}% margin</p>
                        </div>
                        <span className="font-black text-indigo-600">₹{item.basePrice}</span>
                      </div>
                    ))}
                    {engineeringData?.matrix?.cashCows?.length === 0 && <p className="text-sm text-gray-400 font-bold italic">No items match this criteria.</p>}
                  </div>
                </div>

                {/* QUESTION MARKS */}
                <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><AlertTriangle className="w-24 h-24 text-amber-500" /></div>
                  <h3 className="text-lg font-black text-amber-700 mb-2">Question Marks (High Sales, Low Profit)</h3>
                  <p className="text-sm font-bold text-gray-500 mb-4">Popular but low margin. Consider price increase or recipe tweak.</p>
                  <div className="space-y-3 relative z-10">
                    {engineeringData?.matrix?.questionMarks?.map((item: any) => (
                      <div key={item._id} className="flex justify-between items-center bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                        <div>
                          <p className="font-bold text-gray-900">{item.name}</p>
                          <p className="text-xs font-bold text-gray-500">{item.qtySold} sold • {item.calculatedMargin.toFixed(1)}% margin</p>
                        </div>
                        <span className="font-black text-amber-600">₹{item.basePrice}</span>
                      </div>
                    ))}
                    {engineeringData?.matrix?.questionMarks?.length === 0 && <p className="text-sm text-gray-400 font-bold italic">No items match this criteria.</p>}
                  </div>
                </div>

                {/* DOGS */}
                <div className="bg-white rounded-2xl p-6 border border-rose-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingDown className="w-24 h-24 text-rose-500" /></div>
                  <h3 className="text-lg font-black text-rose-700 mb-2">Dogs (Low Sales, Low Profit)</h3>
                  <p className="text-sm font-bold text-gray-500 mb-4">Underperforming. Consider removing from menu.</p>
                  <div className="space-y-3 relative z-10">
                    {engineeringData?.matrix?.dogs?.map((item: any) => (
                      <div key={item._id} className="flex justify-between items-center bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                        <div>
                          <p className="font-bold text-gray-900">{item.name}</p>
                          <p className="text-xs font-bold text-gray-500">{item.qtySold} sold • {item.calculatedMargin.toFixed(1)}% margin</p>
                        </div>
                        <span className="font-black text-rose-600">₹{item.basePrice}</span>
                      </div>
                    ))}
                    {engineeringData?.matrix?.dogs?.length === 0 && <p className="text-sm text-gray-400 font-bold italic">No items match this criteria.</p>}
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'items' && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="relative w-64">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search menu..." className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <button onClick={() => { setEditingItem(null); setShowItemForm(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 font-bold">
                    <tr>
                      <th className="px-6 py-4">Item Name</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Est. Cost</th>
                      <th className="px-6 py-4">Margin</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {menuItems.map((item: any) => (
                      <tr key={item._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => { setEditingItem(item); setShowItemForm(true); }}>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{item.name}</div>
                          {item.sku && <div className="text-xs text-gray-500">SKU: {item.sku}</div>}
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-bold">{item.categoryId?.name}</td>
                        <td className="px-6 py-4 font-black text-gray-900">₹{item.basePrice}</td>
                        <td className="px-6 py-4 font-bold text-gray-500">₹{item.calculatedCost?.toFixed(2) || '0.00'}</td>
                        <td className="px-6 py-4">
                           <span className={clsx("px-2 py-1 rounded-lg font-bold text-xs", item.calculatedMargin > 60 ? "bg-emerald-100 text-emerald-700" : item.calculatedMargin > 30 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700")}>
                             {item.calculatedMargin?.toFixed(1)}%
                           </span>
                        </td>
                        <td className="px-6 py-4">
                          {item.isOutOfStock ? (
                            <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-lg font-bold text-xs">Out of Stock</span>
                          ) : (
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg font-bold text-xs">Active</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'categories' && (
            <div className="text-center p-12 text-gray-500 font-bold border border-dashed border-gray-300 rounded-2xl bg-gray-50">
               Advanced Category Management Module coming in Phase 3!
            </div>
          )}
          
          {activeTab === 'qrmenu' && (
            <div className="text-center p-12 text-gray-500 font-bold border border-dashed border-gray-300 rounded-2xl bg-gray-50">
               QR Menu Preview Module coming in Phase 4!
            </div>
          )}
        </>
      )}

      {showItemForm && (
        <MenuItemForm 
          item={editingItem}
          saving={false} 
          categories={categories}
          onClose={() => setShowItemForm(false)} 
          onSave={async () => {
            setShowItemForm(false);
            fetchData();
          }} 
        />
      )}
    </div>
  );
}
