import React, { useEffect, useState } from 'react';
import { useDateFilter } from '../../contexts/DateFilterContext';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, Info, Clock, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

interface Insight {
  type: 'positive' | 'negative' | 'warning' | 'info';
  message: string;
}

const InsightsView = () => {
  const { startDate, endDate } = useDateFilter();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/insights', {
          params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
        });
        setInsights(res.data.insights || []);
      } catch (err) {
        toast.error('Failed to load AI Insights');
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [startDate, endDate]);

  if (loading) return <div className="animate-pulse space-y-4">
    <div className="h-24 bg-gray-200 rounded-xl"></div>
    <div className="h-24 bg-gray-200 rounded-xl"></div>
  </div>;

  const getIcon = (type: string) => {
    switch(type) {
      case 'positive': return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case 'negative': return <TrendingDown className="w-5 h-5 text-rose-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgClass = (type: string) => {
    switch(type) {
      case 'positive': return 'bg-emerald-50 border-emerald-100';
      case 'negative': return 'bg-rose-50 border-rose-100';
      case 'warning': return 'bg-amber-50 border-amber-100';
      default: return 'bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-md p-6 text-white flex items-center gap-4">
        <Sparkles className="w-10 h-10 text-white opacity-80" />
        <div>
          <h2 className="text-xl font-bold">Business Insights Engine</h2>
          <p className="text-white/80 text-sm mt-1">Automated heuristic analysis based on your selected date range.</p>
        </div>
      </div>

      <div className="space-y-4">
        {insights.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
            No significant insights generated for this period.
          </div>
        ) : (
          insights.map((insight, idx) => (
            <div key={idx} className={clsx(
              "flex items-start gap-4 p-5 rounded-xl border shadow-sm transition-transform hover:-translate-y-0.5",
              getBgClass(insight.type)
            )}>
              <div className="mt-0.5 p-2 bg-white rounded-full shadow-sm">
                {getIcon(insight.type)}
              </div>
              <div>
                <p className="text-gray-900 font-medium text-lg leading-snug">{insight.message}</p>
                <div className="flex items-center gap-2 mt-2 text-xs font-medium text-gray-500 opacity-80">
                  <Clock className="w-3.5 h-3.5" />
                  Generated just now
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InsightsView;
