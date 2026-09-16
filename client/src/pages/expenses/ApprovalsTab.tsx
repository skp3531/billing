import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

export default function ApprovalsTab({ expenses, onUpdate }: any) {
  const [processing, setProcessing] = useState<string | null>(null);

  const pendingExpenses = expenses.filter((e: any) => e.status === 'PENDING_APPROVAL');

  const handleAction = async (id: string, status: string) => {
    try {
      setProcessing(id);
      await api.patch(`/expenses/${id}/status`, { status });
      toast.success(`Expense ${status.toLowerCase()}`);
      onUpdate();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
        <Clock className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-black text-amber-900">Manager Approval Required</h3>
          <p className="text-amber-700 font-bold text-sm mt-1">
            There are {pendingExpenses.length} expense requests waiting for your authorization. Approved expenses will be moved to the accounts payable ledger.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-bold">
              <tr>
                <th className="px-6 py-4">Requested By</th>
                <th className="px-6 py-4">Expense Details</th>
                <th className="px-6 py-4">Payment Info</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pendingExpenses.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500 font-bold">No pending approvals! You are all caught up.</td></tr>
              ) : (
                pendingExpenses.map((exp: any) => (
                  <tr key={exp._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-black text-gray-900">Staff Member</p>
                      <p className="text-xs font-bold text-gray-500">{new Date(exp.date).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{exp.categoryString || exp.categoryId?.name || 'Uncategorized'}</p>
                      <p className="text-xs text-gray-500 max-w-xs truncate">{exp.description || 'No description provided'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-700">{exp.paymentMode}</p>
                      <p className="text-xs text-gray-500">{exp.vendorName || exp.supplierId?.name || 'No Vendor'}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-black text-lg text-gray-900">₹{(exp.totalAmount || exp.amount || 0).toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          disabled={processing === exp._id}
                          onClick={() => handleAction(exp._id, 'REJECTED')}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Reject"
                        >
                          <XCircle className="w-6 h-6" />
                        </button>
                        <button 
                          disabled={processing === exp._id}
                          onClick={() => handleAction(exp._id, 'APPROVED')}
                          className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Approve"
                        >
                          <CheckCircle className="w-6 h-6" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
