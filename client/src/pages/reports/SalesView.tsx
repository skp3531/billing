import React, { useEffect, useState } from 'react';
import { useDateFilter } from '../../contexts/DateFilterContext';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#d97706', '#059669', '#2563eb', '#7c3aed', '#db2777'];

const SalesView = () => {
  const { startDate, endDate } = useDateFilter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/sales', {
          params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
        });
        setData(res.data);
      } catch (err) {
        toast.error('Failed to load sales analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, [startDate, endDate]);

  if (loading) return <div className="animate-pulse h-96 bg-gray-200 rounded-xl"></div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      
      {/* Daily Revenue Trend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Revenue Trend (Daily)</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="_id" tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(val) => `₹${val}`} tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} />
              <Tooltip 
                formatter={(value: any) => [`₹${value.toFixed(2)}`, 'Revenue']}
                labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#d97706" strokeWidth={3} dot={{ r: 4, fill: '#d97706', strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Type Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Revenue by Order Type</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.orderTypeBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="revenue"
                  nameKey="_id"
                >
                  {data.orderTypeBreakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `₹${value.toFixed(2)}`} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Hours Heatmap / Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Peak Hours (Revenue)</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.peakHours}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="_id" 
                  tickFormatter={(val) => `${val}:00`} 
                  tick={{fontSize: 12, fill: '#6b7280'}} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis hide />
                <Tooltip 
                  formatter={(value: any) => [`₹${value.toFixed(2)}`, 'Revenue']}
                  labelFormatter={(label) => `Time: ${label}:00 - ${label}:59`}
                  cursor={{fill: '#f3f4f6'}}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesView;
