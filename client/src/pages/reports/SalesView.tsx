import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { TrendingUp, FileText } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const dummyData = [
  { time: '10:00 AM', sales: 4000 },
  { time: '12:00 PM', sales: 12000 },
  { time: '02:00 PM', sales: 15000 },
  { time: '04:00 PM', sales: 8000 },
  { time: '06:00 PM', sales: 25000 },
  { time: '08:00 PM', sales: 32000 },
  { time: '10:00 PM', sales: 18000 },
];

export default function SalesView() {
  const { dateRange } = useOutletContext<any>();

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-indigo-600" /> Sales Command Center
        </h1>
        <p className="text-gray-500 font-bold mt-1 text-sm">Revenue trends, hourly heatmaps, and channel breakdowns</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="font-black text-gray-900 mb-6 flex items-center gap-2"><FileText className="w-5 h-5 text-gray-400" /> Revenue Over Time ({dateRange})</h3>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dummyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#111827', fontWeight: 'bold' }}
                formatter={(value: any) => [`₹${value}`, 'Sales']}
              />
              <Area type="monotone" dataKey="sales" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center h-64">
          <p className="font-bold text-gray-400">Channel Breakdown Pie Chart Rendering...</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center h-64">
          <p className="font-bold text-gray-400">Sales Heatmap Matrix Rendering...</p>
        </div>
      </div>
    </div>
  );
}
