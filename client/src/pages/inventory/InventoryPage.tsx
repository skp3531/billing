import React, { useEffect, useState } from 'react';
import { getRawMaterials, createRawMaterial, updateRawMaterial, deleteRawMaterial } from '../../api/inventory.api';
import toast from 'react-hot-toast';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

const InventoryPage = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', unit: '', unitCost: 0, minStockLevel: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await getRawMaterials();
      setMaterials(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateRawMaterial(editingId, formData);
        toast.success('Item updated');
      } else {
        await createRawMaterial(formData);
        toast.success('Item created');
      }
      setShowModal(false);
      setFormData({ name: '', unit: '', unitCost: 0, minStockLevel: 0 });
      setEditingId(null);
      fetchMaterials();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error saving item');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      try {
        await deleteRawMaterial(id);
        fetchMaterials();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
        <button
          onClick={() => { setFormData({ name: '', unit: '', unitCost: 0, minStockLevel: 0 }); setEditingId(null); setShowModal(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5" /> Add Item
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-medium text-gray-600">Name</th>
              <th className="p-4 font-medium text-gray-600">Unit</th>
              <th className="p-4 font-medium text-gray-600">Unit Cost</th>
              <th className="p-4 font-medium text-gray-600">Current Stock</th>
              <th className="p-4 font-medium text-gray-600">Min Stock</th>
              <th className="p-4 font-medium text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>
            ) : materials.length === 0 ? (
              <tr><td colSpan={6} className="p-4 text-center">No inventory items found</td></tr>
            ) : (
              materials.map(m => (
                <tr key={m._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4">{m.name}</td>
                  <td className="p-4">{m.unit}</td>
                  <td className="p-4">₹{m.unitCost.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-sm ${m.currentStock <= m.minStockLevel ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {m.currentStock}
                    </span>
                  </td>
                  <td className="p-4">{m.minStockLevel}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditingId(m._id); setFormData({ name: m.name, unit: m.unit, unitCost: m.unitCost, minStockLevel: m.minStockLevel }); setShowModal(true); }} className="text-blue-500 hover:text-blue-700">
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(m._id)} className="text-red-500 hover:text-red-700">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit' : 'Add'} Inventory Item</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. kg, liter"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    value={formData.unitCost}
                    onChange={e => setFormData({ ...formData, unitCost: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock Level</label>
                  <input
                    type="number"
                    required
                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    value={formData.minStockLevel}
                    onChange={e => setFormData({ ...formData, minStockLevel: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
