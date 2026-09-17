import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { ShieldCheck, Download } from 'lucide-react';

export default function GstView() {
  const { dateRange } = useOutletContext<any>();
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-rose-600" /> GST Control Center
          </h1>
          <p className="text-gray-500 font-bold mt-1 text-sm">Tax compliance, CGST/SGST breakdowns, and GSTR exports</p>
        </div>
        <button className="bg-rose-50 text-rose-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-rose-100 transition-colors">
          <Download className="w-4 h-4" /> Export GSTR-1
        </button>
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm h-96 flex items-center justify-center">
        <p className="font-bold text-gray-400">GST Liability & Input Tax Credit Ledgers Rendering...</p>
      </div>
    </div>
  );
}
