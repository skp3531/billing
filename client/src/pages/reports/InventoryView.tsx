import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Package } from 'lucide-react';

export default function InventoryView() {
  const { dateRange } = useOutletContext<any>();
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <Package className="w-8 h-8 text-amber-600" /> Food Cost & Supply
        </h1>
        <p className="text-gray-500 font-bold mt-1 text-sm">Inventory consumption, aging, and supplier performance</p>
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm h-96 flex items-center justify-center">
        <p className="font-bold text-gray-400">Inventory Aging & Consumption Charts Rendering...</p>
      </div>
    </div>
  );
}
