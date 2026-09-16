import React, { useState, useEffect } from 'react';
import { Target, Plus, IndianRupee } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

export default function BudgetsTab({ onUpdate }: any) {
  const [categories, setCategories] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newCatName, setNewCatName] = useState('');
  const [budgetForm, setBudgetForm] = useState({ categoryId: '', amount: 0, period: 'MONTHLY' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catRes, budRes] = await Promise.all([
        api.get('/expenses/categories').catch(() => ({ data: { data: [] } })),
        api.get('/expenses/budgets').catch(() => ({ data: { data: [] } }))
      ]);
      setCategories(catRes.data.data);
      setBudgets(budRes.data.data);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    try {
      await api.post('/expenses/categories', { name: newCatName, type: 'VARIABLE' });
      toast.success('Category created');
      setNewCatName('');
      fetchData();
    } catch {
      toast.error('Failed to create category');
    }
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetForm.categoryId || budgetForm.amount <= 0) return toast.error('Invalid budget data');
    try {
      await api.post('/expenses/budgets', budgetForm);
      toast.success('Budget allocated successfully');
      setBudgetForm({ categoryId: '', amount: 0, period: 'MONTHLY' });
      fetchData();
      onUpdate(); // refresh dashboard
    } catch {
      toast.error('Failed to allocate budget');
    }
  };

  if (loading) return <div className="p-8 text-center font-bold text-gray-500">Loading Configuration...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* Category Manager */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-black text-gray-900 mb-1">Expense Categories</h2>
          <p className="text-gray-500 text-sm font-bold mb-6">Define your chart of accounts</p>
          
          <form onSubmit={handleCreateCategory} className="flex gap-3 mb-6">
            <input required type="text" placeholder="e.g. Marketing, Rent, Packaging" value={newCatName} onChange={e => setNewCatName(e.target.value)} className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
            <button type="submit" className="bg-gray-900 text-white px-5 py-3 rounded-xl font-black shadow-lg shadow-gray-200 hover:bg-gray-800 transition-colors flex items-center gap-2">
              <Plus className="w-5 h-5" /> Add
            </button>
          </form>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {categories.map(c => (
              <div key={c._id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                <span className="font-bold text-gray-700">{c.name}</span>
                <span className="text-xs font-black bg-white px-2 py-1 rounded text-gray-400 border border-gray-200">{c.type}</span>
              </div>
            ))}
            {categories.length === 0 && <p className="text-sm font-bold text-gray-400 text-center py-4">No categories defined yet.</p>}
          </div>
        </div>
      </div>

      {/* Budget Manager */}
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 shadow-sm p-6">
          <h2 className="text-xl font-black text-indigo-900 flex items-center gap-2 mb-1">
            <Target className="w-6 h-6 text-indigo-500" /> Budget Allocation
          </h2>
          <p className="text-indigo-700/70 text-sm font-bold mb-6">Set spending limits to trigger AI leak alerts</p>
          
          <form onSubmit={handleCreateBudget} className="space-y-4 mb-8">
            <div>
              <label className="block text-xs font-bold text-indigo-900 mb-1">Select Category</label>
              <select required value={budgetForm.categoryId} onChange={e => setBudgetForm({...budgetForm, categoryId: e.target.value})} className="w-full p-3 bg-white border border-indigo-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-900">
                <option value="">Choose category...</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-indigo-900 mb-1">Monthly Limit (₹)</label>
                <div className="relative">
                  <IndianRupee className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                  <input type="number" required min="1" value={budgetForm.amount || ''} onChange={e => setBudgetForm({...budgetForm, amount: Number(e.target.value)})} className="w-full pl-10 pr-4 py-3 bg-white border border-indigo-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-black text-indigo-900" placeholder="0.00" />
                </div>
              </div>
              <div className="w-1/3">
                <label className="block text-xs font-bold text-indigo-900 mb-1">Period</label>
                <select value={budgetForm.period} onChange={e => setBudgetForm({...budgetForm, period: e.target.value})} className="w-full p-3 bg-white border border-indigo-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-900">
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors">
              Enforce Budget
            </button>
          </form>

          <div className="space-y-3">
            <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider mb-2">Active Budgets</h3>
            {budgets.map(b => (
              <div key={b._id} className="p-4 bg-white rounded-xl border border-indigo-100 shadow-sm flex justify-between items-center">
                <div>
                  <p className="font-bold text-indigo-900">{b.categoryId?.name || 'Unknown'}</p>
                  <p className="text-xs font-bold text-indigo-400">{b.period}</p>
                </div>
                <span className="font-black text-lg text-emerald-600">₹{b.amount.toLocaleString()}</span>
              </div>
            ))}
            {budgets.length === 0 && <p className="text-sm font-bold text-indigo-400 text-center py-4">No budgets mapped yet.</p>}
          </div>
        </div>
      </div>

    </div>
  );
}
