import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { getReportData, getInventoryReport, getProfitLossReport, getAdvancedReports } from '../../api/analytics.api';
import { format, subDays } from 'date-fns';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState<'sales' | 'inventory' | 'profit-loss' | 'advanced'>('sales');
  
  const [data, setData] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [profitLoss, setProfitLoss] = useState<any>(null);
  const [advanced, setAdvanced] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const fetchReports = async () => {
    try {
      setLoading(true);
      if (activeTab === 'sales') {
        const res = await getReportData({ startDate, endDate });
        setData(res);
      } else if (activeTab === 'inventory') {
        const res = await getInventoryReport();
        setInventory(res.inventory || []);
      
      } else if (activeTab === 'advanced') {
        const res = await getAdvancedReports({ startDate, endDate });
        setAdvanced(res);
} else if (activeTab === 'profit-loss') {
        const res = await getProfitLossReport({ startDate, endDate });
        setProfitLoss(res);
      }
    } catch (error) {
      console.error('Failed to fetch reports', error);
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (activeTab === 'sales' && data.length > 0) {
      const headers = ['Date', 'Total Orders', 'Total Revenue'];
      const csvContent = [headers.join(','), ...data.map(row => `${row._id},${row.ordersCount},${row.revenue.toFixed(2)}`)].join('\n');
      downloadCSV(csvContent, `sales_report_${startDate}_to_${endDate}.csv`);
    } else if (activeTab === 'inventory' && inventory.length > 0) {
      const headers = ['Material', 'Current Stock', 'Min Stock', 'Unit Cost'];
      const csvContent = [headers.join(','), ...inventory.map(row => `${row.name},${row.currentStock} ${row.unit},${row.minStockLevel} ${row.unit},${row.unitCost}`)].join('\n');
      downloadCSV(csvContent, `inventory_report.csv`);
    } else {
      toast.error('No data to export for this report');
    }
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate, activeTab]);

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">View your analytics and performance</p>
        </div>
        <div className="flex gap-4 items-end">
          {activeTab !== 'inventory' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm" />
              </div>
            </>
          )}
          <button onClick={exportToCSV} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors h-[38px]">
            Export to CSV
          </button>
        </div>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <button onClick={() => setActiveTab('sales')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'sales' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
          Sales Report
        </button>
        <button onClick={() => setActiveTab('inventory')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'inventory' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
          Inventory Report
        </button>
        
        <button onClick={() => setActiveTab('advanced')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'advanced' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
          Advanced Analytics
        </button>
<button onClick={() => setActiveTab('profit-loss')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'profit-loss' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
          Profit & Loss
        </button>
      </div>

      {activeTab === 'sales' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders Count</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">Loading...</td></tr>
              ) : data.length > 0 ? (
                data.map((row, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row._id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.ordersCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">₹{row.revenue.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Level</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Cost</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">Loading...</td></tr>
              ) : inventory.length > 0 ? (
                inventory.map((row, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{row.name}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${row.currentStock <= row.minStockLevel ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>{row.currentStock} {row.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.minStockLevel} {row.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{row.unitCost}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">No inventory found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'profit-loss' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 p-6 max-w-3xl">
          {loading ? (
            <div className="text-center text-sm text-gray-500">Loading...</div>
          ) : profitLoss ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div className="text-gray-600 font-medium">Total Revenue (Sales)</div>
                <div className="text-right font-semibold text-green-600">₹{profitLoss.totalRevenue.toFixed(2)}</div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div className="text-gray-600 font-medium">Total Purchases</div>
                <div className="text-right font-semibold text-red-500">- ₹{profitLoss.totalPurchase.toFixed(2)}</div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div className="text-gray-600 font-medium">Total Expenses</div>
                <div className="text-right font-semibold text-red-500">- ₹{profitLoss.totalExpense.toFixed(2)}</div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-lg font-bold text-gray-900">Net Profit</div>
                <div className={`text-right text-xl font-bold ${profitLoss.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{profitLoss.netProfit.toFixed(2)}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-sm text-gray-500">No data available.</div>
          )}
        </div>
      )}
    
      {activeTab === 'advanced' && advanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-bold text-lg mb-4">Payment Methods</h3>
            <ul className="space-y-3">
              {advanced.paymentMethods?.map((pm: any) => (
                <li key={pm._id || 'unknown'} className="flex justify-between border-b pb-2">
                  <span className="capitalize">{pm._id || 'Not specified'}</span>
                  <div className="text-right">
                    <span className="font-bold text-green-600 mr-3">₹{pm.revenue.toFixed(2)}</span>
                    <span className="text-gray-500 text-sm">({pm.count} orders)</span>
                  </div>
                </li>
              ))}
              {(!advanced.paymentMethods || advanced.paymentMethods.length === 0) && <p className="text-gray-500">No data</p>}
            </ul>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-bold text-lg mb-4">Top Selling Items</h3>
            <ul className="space-y-3">
              {advanced.topItems?.map((item: any) => (
                <li key={item._id} className="flex justify-between border-b pb-2">
                  <span>{item._id}</span>
                  <div className="text-right">
                    <span className="font-bold text-green-600 mr-3">₹{item.revenue.toFixed(2)}</span>
                    <span className="text-gray-500 text-sm">({item.quantity} sold)</span>
                  </div>
                </li>
              ))}
              {(!advanced.topItems || advanced.topItems.length === 0) && <p className="text-gray-500">No data</p>}
            </ul>
          </div>
        </div>
      )}
</div>
  );
};

export default ReportsPage;
