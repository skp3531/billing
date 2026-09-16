import React from 'react';
export default function ExpenseModal({ expense, onClose, onSave }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-2xl">
        <h2>Expense Entry Builder</h2>
        <p>Coming in Phase 3!</p>
        <button onClick={onClose} className="px-4 py-2 mt-4 bg-gray-200 rounded">Close</button>
      </div>
    </div>
  );
}
