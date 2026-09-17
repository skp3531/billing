import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, UserPlus, UserCheck, HeartPulse } from 'lucide-react';

export default function CustomersView() {
  const { dateRange } = useOutletContext<any>();
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-500" /> Customer Intelligence
        </h1>
        <p className="text-gray-500 font-bold mt-1 text-sm">RFM Analysis, Cohorts, and Churn Prediction</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-500 flex items-center gap-2"><UserPlus className="w-4 h-4" /> New Acquisition</h3>
          <p className="text-3xl font-black text-gray-900 mt-2">1,245</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-500 flex items-center gap-2"><UserCheck className="w-4 h-4" /> Repeat Customers</h3>
          <p className="text-3xl font-black text-gray-900 mt-2">4,821</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-500 flex items-center gap-2"><HeartPulse className="w-4 h-4" /> Retention Rate</h3>
          <p className="text-3xl font-black text-gray-900 mt-2">78.4%</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm h-96 flex items-center justify-center">
        <p className="font-bold text-gray-400">Customer Cohort Analysis Matrix Rendering...</p>
      </div>
    </div>
  );
}
