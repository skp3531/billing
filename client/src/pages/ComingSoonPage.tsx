import React from 'react';
import { Link } from 'react-router-dom';

const ComingSoonPage = ({ moduleName = "Module" }: { moduleName?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-4">
      <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6">
        <span className="text-amber-600 text-3xl font-bold">{moduleName.charAt(0)}</span>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">{moduleName}</h2>
      <p className="text-lg text-gray-600 mb-8 max-w-md">
        This feature is coming in the next development phase. We're working hard to bring you the best experience!
      </p>
      <Link to="/dashboard" className="px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors">
        Go to Dashboard
      </Link>
    </div>
  );
};

export default ComingSoonPage;
