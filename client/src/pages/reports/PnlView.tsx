import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Wallet, DollarSign, TrendingDown } from 'lucide-react';

export default function PnlView() {
  const { dateRange } = useOutletContext<any>();
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <Wallet className="w-8 h-8 text-emerald-500" /> Profitability & P&L
        </h1>
        <p className="text-gray-500 font-bold mt-1 text-sm">Revenue vs COGS, Payroll, and Operations Expenses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
          <h3 className="font-bold text-emerald-700">Gross Revenue</h3>
          <p className="text-3xl font-black text-emerald-900 mt-2">₹142,500</p>
        </div>
        <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
          <h3 className="font-bold text-rose-700 flex items-center gap-2">COGS (Food Cost)</h3>
          <p className="text-3xl font-black text-rose-900 mt-2">₹40,200</p>
        </div>
        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
          <h3 className="font-bold text-amber-700">Opex & Payroll</h3>
          <p className="text-3xl font-black text-amber-900 mt-2">₹28,400</p>
        </div>
        <div className="bg-indigo-900 p-6 rounded-2xl border border-indigo-800 text-white shadow-xl">
          <h3 className="font-bold text-indigo-200">Net Profit Margin</h3>
          <p className="text-4xl font-black mt-2">51.8%</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm h-96 flex items-center justify-center">
        <p className="font-bold text-gray-400">Profitability Waterfall Chart Rendering...</p>
      </div>
    </div>
  );
}
