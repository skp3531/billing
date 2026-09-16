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
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="relative w-64">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search categories..." className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Category
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {categories.map((c: any) => (
                    <div key={c._id} className="flex justify-between items-center bg-white border border-gray-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center font-black">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{c.name}</h4>
                          <p className="text-xs text-gray-500 font-bold">{menuItems.filter((i:any) => i.categoryId?._id === c._id).length} Items</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold">Active</span>
                        <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800">Edit</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'qrmenu' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Settings Panel */}
              <div className="col-span-1 lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2"><QrCode className="w-5 h-5 text-indigo-500" /> Live QR Menu Settings</h2>
                  <p className="text-gray-500 text-sm font-bold mb-6">Customize how your customers see your menu when they scan the table QR code.</p>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Primary Color Theme</label>
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 border-2 border-indigo-200 cursor-pointer shadow-sm"></div>
                        <div className="w-10 h-10 rounded-full bg-rose-600 cursor-pointer"></div>
                        <div className="w-10 h-10 rounded-full bg-emerald-600 cursor-pointer"></div>
                        <div className="w-10 h-10 rounded-full bg-amber-500 cursor-pointer"></div>
                        <div className="w-10 h-10 rounded-full bg-gray-900 cursor-pointer"></div>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-6 space-y-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-5 h-5 text-indigo-600 rounded border-gray-300" />
                        <div>
                          <p className="font-bold text-gray-800">Show Nutritional Info</p>
                          <p className="text-xs text-gray-500 font-bold">Display calories and protein tags</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-5 h-5 text-indigo-600 rounded border-gray-300" />
                        <div>
                          <p className="font-bold text-gray-800">Show Allergen Warnings</p>
                          <p className="text-xs text-gray-500 font-bold">Highlight nuts, soy, gluten etc.</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-5 h-5 text-indigo-600 rounded border-gray-300" />
                        <div>
                          <p className="font-bold text-gray-800">Enable Table Ordering</p>
                          <p className="text-xs text-gray-500 font-bold">Allow guests to place orders directly from their phone</p>
                        </div>
                      </label>
                    </div>
                    
                    <button className="w-full bg-indigo-600 text-white font-black py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                      Download HD QR Code
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Mobile Preview */}
              <div className="col-span-1 flex justify-center">
                <div className="w-[320px] h-[640px] bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl relative border-8 border-gray-800">
                  <div className="w-32 h-6 bg-gray-800 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-xl z-20"></div>
                  <div className="w-full h-full bg-gray-50 rounded-3xl overflow-hidden relative flex flex-col">
                    {/* Fake Phone Status Bar */}
                    <div className="h-6 w-full bg-indigo-600"></div>
                    
                    {/* Header */}
                    <div className="bg-indigo-600 text-white p-4 pt-2 shadow-md z-10">
                      <h3 className="font-black text-center text-lg">{currentOutlet?.name || 'Restaurant'}</h3>
                      <p className="text-center text-indigo-200 text-xs font-bold mt-1">Table 4</p>
                    </div>
                    
                    {/* Categories Scroll */}
                    <div className="flex gap-2 overflow-x-auto p-3 bg-white shadow-sm hide-scrollbar z-10">
                      <div className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-xs font-bold whitespace-nowrap shadow-md shadow-indigo-200">All Items</div>
                      <div className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-bold whitespace-nowrap">Beverages</div>
                      <div className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-bold whitespace-nowrap">Food</div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-4 pb-20">
                      {menuItems.filter((i:any) => i.active && i.availability?.qrMenu !== false).slice(0,4).map((item: any) => (
                        <div key={item._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                          <div className="h-32 bg-gray-200 w-full relative">
                            {item.isBestseller && <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm">BESTSELLER</span>}
                            <span className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-gray-900 font-black px-2 py-1 rounded-lg text-sm shadow-sm">₹{item.basePrice}</span>
                          </div>
                          <div className="p-3">
                            <div className="flex items-start gap-1">
                              <div className={clsx("w-3 h-3 rounded-sm border flex items-center justify-center mt-1 shrink-0", item.isVeg ? "border-emerald-500" : "border-rose-500")}>
                                <div className={clsx("w-1.5 h-1.5 rounded-full", item.isVeg ? "bg-emerald-500" : "bg-rose-500")}></div>
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 text-sm leading-tight">{item.name}</h4>
                                <p className="text-gray-400 text-[10px] font-bold mt-0.5 line-clamp-1">{item.description || 'Delicious freshly prepared item.'}</p>
                              </div>
                            </div>
                            <button className="w-full mt-3 bg-indigo-50 text-indigo-600 font-bold text-xs py-2 rounded-lg border border-indigo-100">Add to Order</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Floating Cart */}
                    <div className="absolute bottom-4 left-4 right-4 bg-gray-900 text-white p-3 rounded-2xl flex justify-between items-center shadow-2xl">
                      <div>
                        <p className="text-xs text-gray-400 font-bold">2 Items</p>
                        <p className="font-black text-sm">₹240</p>
                      </div>
                      <button className="bg-indigo-600 px-4 py-2 rounded-xl text-sm font-black shadow-lg shadow-indigo-900/50">View Cart</button>
                    </div>
                  </div>
                </div>
              </div>
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
