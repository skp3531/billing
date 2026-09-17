import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { PieChart as PieChartIcon, Info } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ZAxis } from 'recharts';
import api from '../../api/axios';

export default function ProductsView() {
  const { dateRange } = useOutletContext<any>();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/menu-engineering');
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-12 font-bold text-gray-500 animate-pulse">Loading Menu Intelligence...</div>;

  const avgVol = data.reduce((acc, curr) => acc + curr.volume, 0) / (data.length || 1);
  const avgMargin = data.reduce((acc, curr) => acc + curr.margin, 0) / (data.length || 1);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-[#0B1220] p-4 rounded-xl border border-gray-700 shadow-xl text-white">
          <p className="font-black text-sm mb-2">{d.name}</p>
          <p className="text-xs text-gray-400">Category: <span className="text-gray-200 font-bold">{d.category}</span></p>
          <p className="text-xs text-gray-400">Margin: <span className="text-emerald-400 font-bold">₹{d.margin.toFixed(2)}</span></p>
          <p className="text-xs text-gray-400">Volume: <span className="text-amber-400 font-bold">{d.volume} sold</span></p>
          <div className="mt-2 pt-2 border-t border-gray-700">
            <span className={`text-[10px] font-black px-2 py-1 rounded-full ${
              d.quadrant === 'STAR' ? 'bg-amber-500/20 text-amber-400' :
              d.quadrant === 'CASH_COW' ? 'bg-emerald-500/20 text-emerald-400' :
              d.quadrant === 'QUESTION_MARK' ? 'bg-blue-500/20 text-blue-400' :
              'bg-rose-500/20 text-rose-400'
            }`}>
              {d.quadrant.replace('_', ' ')}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <PieChartIcon className="w-8 h-8 text-amber-500" /> Menu Engineering
        </h1>
        <p className="text-gray-500 font-bold mt-1 text-sm">Automatically classify items into Stars, Cash Cows, Dogs, and Question Marks</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-start gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8">
          <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600 font-medium">
            This quadrant plots <strong className="text-gray-900">Profit Margin (Y-Axis)</strong> vs <strong className="text-gray-900">Sales Volume (X-Axis)</strong>. 
            Items in the top-right are your <span className="text-amber-500 font-bold">Stars</span> (High Profit, High Volume). 
            Items in the bottom-left are <span className="text-rose-500 font-bold">Dogs</span> (Low Profit, Low Volume).
          </p>
        </div>

        <div className="h-[600px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" dataKey="volume" name="Sales Volume" label={{ value: 'Sales Volume →', position: 'bottom', fontWeight: 'bold', fill: '#9ca3af' }} />
              <YAxis type="number" dataKey="margin" name="Profit Margin" label={{ value: 'Profit Margin (₹) →', angle: -90, position: 'left', fontWeight: 'bold', fill: '#9ca3af' }} />
              <ZAxis type="number" range={[100, 400]} />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              
              <ReferenceLine x={avgVol} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'top', value: 'Avg Volume', fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
              <ReferenceLine y={avgMargin} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'right', value: 'Avg Margin', fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
              
              <Scatter name="Stars" data={data.filter(d => d.quadrant === 'STAR')} fill="#F59E0B" />
              <Scatter name="Cash Cows" data={data.filter(d => d.quadrant === 'CASH_COW')} fill="#10B981" />
              <Scatter name="Question Marks" data={data.filter(d => d.quadrant === 'QUESTION_MARK')} fill="#3B82F6" />
              <Scatter name="Dogs" data={data.filter(d => d.quadrant === 'DOG')} fill="#F43F5E" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
