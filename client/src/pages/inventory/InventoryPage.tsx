import React, { useEffect, useState } from 'react';
import { getRawMaterials, createRawMaterial, updateRawMaterial, deleteRawMaterial } from '../../api/inventory.api';
import toast from 'react-hot-toast';
import { 
  PackageSearch, 
  Plus, 
  AlertTriangle, 
  TrendingDown, 
  Boxes, 
  Pencil, 
  Trash2,
  RefreshCcw,
  BadgeDollarSign
} from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../../store/authStore';

export default function InventoryPage() {
  const { currentOutlet } = useAuthStore();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  
  // Forms
  const [formData, setFormData] = useState({ name: '', unit: 'kg', unitCost: 0, minStockLevel: 5, currentStock: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adjustData, setAdjustData] = useState({ id: '', name: '', adjustment: 0, type: 'add' });

  const fetchMaterials = async (silent = false) => {
    if (!currentOutlet) return;
    try {
      if (!silent) setLoading(true);
      const res = await getRawMaterials();
      setMaterials(res.data?.data || res.data || []);
    } catch (error) {
      if (!silent) toast.error('Failed to load inventory');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [currentOutlet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateRawMaterial(editingId, formData);
        toast.success('Material updated');
      } else {
        await createRawMaterial(formData);
        toast.success('Material added');
      }
      setIsModalOpen(false);
      fetchMaterials(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save material');
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const material = materials.find(m => m._id === adjustData.id);
      if (!material) return;

      const delta = adjustData.type === 'add' ? Number(adjustData.adjustment) : -Number(adjustData.adjustment);
      const newStock = (material.currentStock || 0) + delta;

      await updateRawMaterial(adjustData.id, { currentStock: newStock });
      toast.success('Stock adjusted successfully');
      setIsAdjustModalOpen(false);
      fetchMaterials(true);
    } catch (err) {
      toast.error('Failed to adjust stock');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this material?')) return;
    try {
      await deleteRawMaterial(id);
      toast.success('Deleted');
      fetchMaterials(true);
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const lowStockItems = materials.filter(m => (m.currentStock || 0) <= (m.minStockLevel || 0));
  const totalValue = materials.reduce((acc, m) => acc + ((m.currentStock || 0) * (m.unitCost || 0)), 0);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50 overflow-hidden">
      
      {/* Header & KPI Cards */}
      <div className="p-6 bg-white border-b border-gray-200 shrink-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Inventory & Stock</h1>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-0.5">Live Warehouse Management</p>
          </div>
          <button 
            onClick={() => { setEditingId(null); setFormData({ name: '', unit: 'kg', unitCost: 0, minStockLevel: 5, currentStock: 0 }); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-black transition-all"
          >
            <Plus className="w-5 h-5" /> Add Material
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Boxes className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Total Items</p>
              <h3 className="text-2xl font-black text-gray-900">{materials.length}</h3>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><TrendingDown className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Low Stock Alerts</p>
              <h3 className="text-2xl font-black text-rose-600">{lowStockItems.length}</h3>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><BadgeDollarSign className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Total Inventory Value</p>
              <h3 className="text-2xl font-black text-gray-900">₹{totalValue.toLocaleString()}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-500">Item Name</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-500">Stock Level</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-500">Unit Cost</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-500">Total Value</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading inventory...</td></tr>
              ) : materials.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-gray-500 flex flex-col items-center"><PackageSearch className="w-12 h-12 mb-3 opacity-20" /> No materials found.</td></tr>
              ) : (
                materials.map(m => {
                  const isLow = (m.currentStock || 0) <= (m.minStockLevel || 0);
                  return (
                    <tr key={m._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-gray-900 text-base">{m.name}</p>
                        <p className="text-xs font-semibold text-gray-400">Min Alert: {m.minStockLevel} {m.unit}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={clsx("text-lg font-black", isLow ? "text-rose-600" : "text-gray-900")}>
                            {m.currentStock || 0}
                          </span>
                          <span className="text-sm font-bold text-gray-500">{m.unit}</span>
                          {isLow && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-gray-700">₹{m.unitCost}</td>
                      <td className="p-4 font-bold text-gray-900">₹{((m.currentStock || 0) * (m.unitCost || 0)).toLocaleString()}</td>
                      <td className="p-4 text-right space-x-2">
                        <button 
                          onClick={() => { setAdjustData({ id: m._id, name: m.name, adjustment: 0, type: 'add' }); setIsAdjustModalOpen(true); }}
                          className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                          title="Adjust Stock"
                        >
                          <RefreshCcw className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setFormData({ name: m.name, unit: m.unit, unitCost: m.unitCost, minStockLevel: m.minStockLevel, currentStock: m.currentStock }); setEditingId(m._id); setIsModalOpen(true); }}
                          className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(m._id)}
                          className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAdjustSubmit} className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl">
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <h2 className="text-lg font-black text-gray-900">Audit Stock: {adjustData.name}</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                <button type="button" onClick={() => setAdjustData({ ...adjustData, type: 'add' })} className={clsx("flex-1 py-1.5 rounded-lg font-bold text-sm", adjustData.type === 'add' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500')}>Add Stock (+)</button>
                <button type="button" onClick={() => setAdjustData({ ...adjustData, type: 'deduct' })} className={clsx("flex-1 py-1.5 rounded-lg font-bold text-sm", adjustData.type === 'deduct' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500')}>Waste/Loss (-)</button>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantity</label>
                <input required type="number" step="0.01" min="0.01" value={adjustData.adjustment || ''} onChange={e => setAdjustData({ ...adjustData, adjustment: parseFloat(e.target.value) })} className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-emerald-500 font-bold" placeholder="e.g. 5" />
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
              <button type="button" onClick={() => setIsAdjustModalOpen(false)} className="flex-1 py-2.5 font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
              <button type="submit" className="flex-1 py-2.5 font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors">Confirm</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <h2 className="text-lg font-black text-gray-900">{editingId ? 'Edit Material' : 'Add New Material'}</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl p-2.5 outline-none focus:border-indigo-500 font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unit</label>
                  <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl p-2.5 outline-none font-bold">
                    <option value="kg">Kilogram (kg)</option>
                    <option value="g">Gram (g)</option>
                    <option value="l">Liter (l)</option>
                    <option value="ml">Milliliter (ml)</option>
                    <option value="pcs">Pieces (pcs)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cost per Unit (₹)</label>
                  <input required type="number" step="0.01" value={formData.unitCost} onChange={e => setFormData({...formData, unitCost: Number(e.target.value)})} className="w-full border-2 border-gray-200 rounded-xl p-2.5 outline-none font-bold" />
                </div>
                {!editingId && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Initial Stock</label>
                    <input required type="number" step="0.01" value={formData.currentStock} onChange={e => setFormData({...formData, currentStock: Number(e.target.value)})} className="w-full border-2 border-gray-200 rounded-xl p-2.5 outline-none font-bold" />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Min Alert Level</label>
                  <input required type="number" step="0.01" value={formData.minStockLevel} onChange={e => setFormData({...formData, minStockLevel: Number(e.target.value)})} className="w-full border-2 border-gray-200 rounded-xl p-2.5 outline-none font-bold" />
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
              <button type="submit" className="flex-1 py-2.5 font-bold bg-gray-900 text-white rounded-xl hover:bg-black transition-colors">Save Material</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
