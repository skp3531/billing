import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import clsx from 'clsx';

interface KPICardProps {
  title: string;
  value: string | number;
  previousValue?: string | number;
  trendPercentage?: number;
  icon?: React.ReactNode;
  format?: 'currency' | 'number' | 'percentage';
}

export const KPICard: React.FC<KPICardProps> = ({ 
  title, value, previousValue, trendPercentage, icon, format = 'number' 
}) => {
  const isPositive = trendPercentage ? trendPercentage > 0 : false;
  const isNegative = trendPercentage ? trendPercentage < 0 : false;
  const isNeutral = trendPercentage === 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-2xl font-bold text-gray-900">
          {format === 'currency' ? \`₹\${value}\` : format === 'percentage' ? \`\${value}%\` : value}
        </span>
      </div>
      
      {trendPercentage !== undefined && (
        <div className="flex items-center gap-1.5 mt-3 text-sm">
          <span className={clsx(
            "flex items-center gap-0.5 font-medium",
            isPositive ? "text-emerald-600" : isNegative ? "text-rose-600" : "text-gray-500"
          )}>
            {isPositive && <TrendingUp className="w-3.5 h-3.5" />}
            {isNegative && <TrendingDown className="w-3.5 h-3.5" />}
            {isNeutral && <Minus className="w-3.5 h-3.5" />}
            {Math.abs(trendPercentage).toFixed(1)}%
          </span>
          <span className="text-gray-400 text-xs">vs previous</span>
        </div>
      )}
    </div>
  );
};
