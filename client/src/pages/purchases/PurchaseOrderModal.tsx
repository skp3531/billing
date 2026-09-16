import React from 'react';
import { X } from 'lucide-react';

export default function PurchaseOrderModal({ po, onClose, onSave }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-2xl w-full max-w-lg text-center">
        <h2 className="text-xl font-bold mb-4">PO Workflow Builder</h2>
        <p className="text-gray-500 mb-6">Coming in Phase 3!</p>
        <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Close</button>
      </div>
    </div>
  );
}
