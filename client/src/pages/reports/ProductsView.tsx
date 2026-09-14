import React, { useEffect, useState } from 'react';
import { useDateFilter } from '../../contexts/DateFilterContext';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ProductsView = () => {
  const { startDate, endDate } = useDateFilter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/products', {
          params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
        });
        setData(res.data);
      } catch (err) {
        toast.error('Failed to load product analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [startDate, endDate]);

  if (loading) return <div className="animate-pulse h-96 bg-gray-200 rounded-xl"></div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Top 10 Best Selling Items (Revenue)</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.topItems} layout="vertical" margin={{ left: 50 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
              <XAxis type="number" tickFormatter={(val) => `₹${val}`} tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{fontSize: 12, fill: '#111827'}} width={100} axisLine={false} tickLine={false} />
              <Tooltip 
                formatter={(value: any, name: any) => [
                  name === 'revenue' ? `₹${value.toFixed(2)}` : value, 
                  name.charAt(0).toUpperCase() + name.slice(1)
                ]}
                cursor={{fill: '#f3f4f6'}}
              />
              <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Category Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Category</th>
                  <th className="px-4 py-3 text-right">Items Sold</th>
                  <th className="px-4 py-3 text-right rounded-r-lg">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.categoryBreakdown.map((cat: any) => (
                  <tr key={cat._id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{cat.name || 'Uncategorized'}</td>
                    <td className="px-4 py-3 text-right">{cat.quantity}</td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-600">₹{cat.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Bottom 5 Selling Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Item</th>
                  <th className="px-4 py-3 text-right">Quantity</th>
                  <th className="px-4 py-3 text-right rounded-r-lg">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.worstItems.map((item: any) => (
                  <tr key={item._id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-rose-600">₹{item.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProductsView;
