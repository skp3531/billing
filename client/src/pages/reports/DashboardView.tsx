import React, { useEffect, useState } from 'react';
import { useDateFilter } from '../../contexts/DateFilterContext';
import { KPICard } from './components/KPICard';
import { IndianRupee, ShoppingBag, Receipt, Users, ArrowDownRight, Tag, Activity } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

const DashboardView = () => {
  const { startDate, endDate } = useDateFilter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/dashboard-kpis', {
          params: { 
            startDate: startDate.toISOString(), 
            endDate: endDate.toISOString() 
          }
        });
        setData(res.data.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch dashboard metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [startDate, endDate]);

  if (loading) return <div className="animate-pulse space-y-4">
    <div className="h-24 bg-gray-200 rounded-xl"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>)}
    </div>
  </div>;

  if (!data) return <div>No data available</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Gross Sales" 
          value={data.grossSales.current} 
          trendPercentage={data.grossSales.growth} 
          format="currency"
          icon={<IndianRupee className="w-4 h-4" />}
        />
        <KPICard 
          title="Net Sales" 
          value={data.netSales.current} 
          trendPercentage={data.netSales.growth} 
          format="currency"
          icon={<IndianRupee className="w-4 h-4" />}
        />
        <KPICard 
          title="Orders Count" 
          value={data.ordersCount.current} 
          trendPercentage={data.ordersCount.growth} 
          format="number"
          icon={<Receipt className="w-4 h-4" />}
        />
        <KPICard 
          title="Average Order Value" 
          value={data.aov.current} 
          trendPercentage={data.aov.growth} 
          format="currency"
          icon={<ShoppingBag className="w-4 h-4" />}
        />
        <KPICard 
          title="Net Profit" 
          value={data.profit.current} 
          trendPercentage={data.profit.growth} 
          format="currency"
          icon={<Activity className="w-4 h-4" />}
        />
        <KPICard 
          title="Unique Customers" 
          value={data.uniqueCustomers.current} 
          trendPercentage={data.uniqueCustomers.growth} 
          format="number"
          icon={<Users className="w-4 h-4" />}
        />
        <KPICard 
          title="Discounts Given" 
          value={data.discounts.current} 
          trendPercentage={data.discounts.growth} 
          format="currency"
          icon={<Tag className="w-4 h-4" />}
        />
        <KPICard 
          title="Refunds" 
          value={data.refunds.current} 
          trendPercentage={data.refunds.growth} 
          format="currency"
          icon={<ArrowDownRight className="w-4 h-4" />}
        />
      </div>
    </div>
  );
};
export default DashboardView;
