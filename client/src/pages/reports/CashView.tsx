import React, { useEffect, useState } from 'react';
import { Layers, CheckCircle, AlertTriangle } from 'lucide-react';
import { cashRegisterApi, CashRegister } from '../../api/cashRegister.api';
import { useAuthStore } from '../../store/authStore';

export default function CashView() {
  const { currentOutlet } = useAuthStore();
  const [history, setHistory] = useState<CashRegister[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        if (!currentOutlet) return;
        const data = await cashRegisterApi.getHistory(currentOutlet._id);
        setHistory(data);
      } catch (err) {
        console.error('Failed to load register history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [currentOutlet]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <Layers className="w-6 h-6 text-indigo-600" /> End of Day (Z-Reports)
        </h1>
        <p className="text-gray-500 font-bold mt-1 text-sm">Historical cash register reconciliations</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 font-bold animate-pulse">Loading Z-Reports...</div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center text-gray-400 font-bold">No closed registers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-black">Shift Date</th>
                  <th className="p-4 font-black">Opened By</th>
                  <th className="p-4 font-black">Opening Cash</th>
                  <th className="p-4 font-black">Cash Sales</th>
                  <th className="p-4 font-black">Expected</th>
                  <th className="p-4 font-black">Actual Count</th>
                  <th className="p-4 font-black">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-bold text-gray-900">
                {history.map(reg => (
                  <tr key={reg._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p>{new Date(reg.openedAt).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-400">{new Date(reg.openedAt).toLocaleTimeString()} - {reg.closedAt ? new Date(reg.closedAt).toLocaleTimeString() : '?'}</p>
                    </td>
                    <td className="p-4 text-gray-600">{(reg.openedBy as any)?.name || 'Unknown'}</td>
                    <td className="p-4">₹{reg.openingBalance}</td>
                    <td className="p-4 text-indigo-600">₹{reg.totalCashSales}</td>
                    <td className="p-4">₹{reg.expectedBalance}</td>
                    <td className="p-4">₹{reg.closingBalance}</td>
                    <td className="p-4">
                      {reg.difference === 0 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs">
                          <CheckCircle className="w-3 h-3" /> Exact
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs ${reg.difference! < 0 ? 'text-rose-600 bg-rose-50' : 'text-amber-600 bg-amber-50'}`}>
                          <AlertTriangle className="w-3 h-3" /> {reg.difference! > 0 ? '+' : ''}{reg.difference}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
