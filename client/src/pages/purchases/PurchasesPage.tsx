import React, { useEffect, useState } from 'react';
import { getPurchases, getSuppliers, getRawMaterials, createPurchase, updatePurchaseStatus } from '../../api/inventory.api';
import { PlusIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const PurchasesPage = () => {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    supplierId: '',
    items: [{ rawMaterialId: '', quantity: 1, unitCost: 0 }],
    status: 'Pending'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, sRes, mRes] = await Promise.all([
        getPurchases(),
        getSuppliers(),
        getRawMaterials()
      ]);
      setPurchases(pRes.data.data);
      setSuppliers(sRes.data.data);
      setMaterials(mRes.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (items: any[]) => {
    return items.reduce((acc, item) => acc + (item.quantity * item.unitCost), 0);
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { rawMaterialId: '', quantity: 1, unitCost: 0 }]
    });
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-fill unit cost if material selected
    if (field === 'rawMaterialId') {
      const material = materials.find(m => m._id === value);
      if (material) {
        newItems[index].unitCost = material.unitCost;
      }
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        items: formData.items.map(item => ({ ...item, total: item.quantity * item.unitCost })),
        totalAmount: calculateTotal(formData.items)
      };
      await createPurchase(payload);
      setShowModal(false);
      setFormData({ supplierId: '', items: [{ rawMaterialId: '', quantity: 1, unitCost: 0 }], status: 'Pending' });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updatePurchaseStatus(id, status);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Purchases</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5" /> Add Purchase
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-medium text-gray-600">Date</th>
              <th className="p-4 font-medium text-gray-600">Supplier</th>
              <th className="p-4 font-medium text-gray-600">Items</th>
              <th className="p-4 font-medium text-gray-600">Total Amount</th>
              <th className="p-4 font-medium text-gray-600">Status</th>
              <th className="p-4 font-medium text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>
            ) : purchases.length === 0 ? (
              <tr><td colSpan={6} className="p-4 text-center">No purchases found</td></tr>
            ) : (
              purchases.map(p => (
                <tr key={p._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4">{new Date(p.date).toLocaleDateString()}</td>
                  <td className="p-4">{p.supplierId?.name || 'Unknown'}</td>
                  <td className="p-4">{p.items.length} items</td>
                  <td className="p-4">₹{p.totalAmount.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-sm ₹{
                      p.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      p.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {p.status === 'Pending' && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleUpdateStatus(p._id, 'Completed')} className="text-green-600 hover:text-green-800" title="Mark Completed">
                          <CheckIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleUpdateStatus(p._id, 'Cancelled')} className="text-red-600 hover:text-red-800" title="Cancel">
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                    {p.status === 'Cancelled' && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleUpdateStatus(p._id, 'Pending')} className="text-yellow-600 hover:text-yellow-800" title="Mark Pending">
                          Pending
                        </button>
                        <button onClick={() => handleUpdateStatus(p._id, 'Completed')} className="text-green-600 hover:text-green-800" title="Mark Completed">
                          <CheckIcon className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl my-8">
            <h2 className="text-xl font-bold mb-4">Add Purchase Record</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                    <select
                      required
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      value={formData.supplierId}
                      onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed (Update Stock)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-700">Items</h3>
                    <button type="button" onClick={handleAddItem} className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                      <PlusIcon className="w-4 h-4 mr-1" /> Add Item
                    </button>
                  </div>
                  
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-4 mb-2 items-end">
                      <div className="flex-1">
                        <select
                          required
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                          value={item.rawMaterialId}
                          onChange={e => handleItemChange(index, 'rawMaterialId', e.target.value)}
                        >
                          <option value="">Select Material</option>
                          {materials.map(m => <option key={m._id} value={m._id}>{m.name} ({m.unit})</option>)}
                        </select>
                      </div>
                      <div className="w-24">
                        <label className="block text-xs text-gray-500 mb-1">Qty</label>
                        <input
                          type="number"
                          required min="0.01" step="0.01"
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                          value={item.quantity}
                          onChange={e => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="w-32">
                        <label className="block text-xs text-gray-500 mb-1">Unit Cost (₹)</label>
                        <input
                          type="number"
                          required min="0" step="0.01"
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                          value={item.unitCost}
                          onChange={e => handleItemChange(index, 'unitCost', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="w-24 pb-2 text-right font-medium">
                        ₹{(item.quantity * item.unitCost).toFixed(2)}
                      </div>
                    </div>
                  ))}
                  <div className="text-right mt-4 text-lg font-bold">
                    Total: ₹{calculateTotal(formData.items).toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Save Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasesPage;
