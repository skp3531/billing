import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Layers } from 'lucide-react';

export default function CashView() {
  const { dateRange } = useOutletContext<any>();
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <Layers className="w-8 h-8 text-teal-600" /> Cash Register Analytics
        </h1>
        <p className="text-gray-500 font-bold mt-1 text-sm">Opening balances, petty cash, and end-of-day variances</p>
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm h-96 flex items-center justify-center">
        <p className="font-bold text-gray-400">Cash Flow Matrix Rendering...</p>
      </div>
    </div>
  );
}
