import React from 'react';
import { useDateFilter } from '../../contexts/DateFilterContext';

const CashView = () => {
  const { startDate, endDate } = useDateFilter();
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h1 className="text-2xl font-bold text-gray-900">Cash Analytics</h1>
      <p className="text-gray-500">Data from {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}</p>
      {/* Component content goes here */}
    </div>
  );
};
export default CashView;
