const fs = require('fs');
let content = fs.readFileSync('client/src/pages/dashboard/DashboardPage.tsx', 'utf8');

// 1. Add recharts imports
content = content.replace(
  "import { Link } from 'react-router-dom';",
  "import { Link } from 'react-router-dom';\nimport { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';"
);

// 2. Add Charts section before the Top Items section
const chartsSection = `
      {/* SALES TREND CHART */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-indigo-500" /> Sales Performance Trend</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.salesTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => \`₹\${val}\`} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => [\`₹\${Number(value).toLocaleString()}\`, 'Revenue']}
              />
              <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
`;

content = content.replace(
  "{/* TOP ITEMS & AI INSIGHTS */}",
  chartsSection + "\n\n        {/* TOP ITEMS & AI INSIGHTS */}"
);

// 3. Update Payment Methods to use Donut Chart
const donutChartCode = `
               <div className="flex-1 flex items-center justify-center min-h-[200px]">
                 {Object.keys(data?.paymentMethods || {}).length > 0 ? (
                   <ResponsiveContainer width="100%" height={200}>
                     <PieChart>
                       <Pie
                         data={Object.entries(data?.paymentMethods || {}).map(([name, value]) => ({ name, value }))}
                         cx="50%"
                         cy="50%"
                         innerRadius={60}
                         outerRadius={80}
                         paddingAngle={5}
                         dataKey="value"
                       >
                         {Object.entries(data?.paymentMethods || {}).map((entry, index) => (
                           <Cell key={\`cell-\${index}\`} fill={['#6366f1', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                         ))}
                       </Pie>
                       <RechartsTooltip 
                          formatter={(value: any) => [\`₹\${Number(value).toLocaleString()}\`, 'Amount']}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                       />
                     </PieChart>
                   </ResponsiveContainer>
                 ) : (
                   <p className="text-sm text-gray-500 italic">No payments received.</p>
                 )}
               </div>
               
               <div className="grid grid-cols-2 gap-2 mt-4">
                 {Object.entries(data?.paymentMethods || {}).map(([method, amount]: any, i) => (
                   <div key={method} className="bg-gray-50 p-2 rounded-lg border border-gray-100 flex justify-between items-center">
                     <div className="flex items-center gap-2">
                       <span className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444'][i % 4] }}></span>
                       <span className="text-xs font-bold text-gray-700 uppercase">{method}</span>
                     </div>
                     <span className="text-xs font-black text-gray-900">₹{amount.toLocaleString()}</span>
                   </div>
                 ))}
               </div>
`;

content = content.replace(
  /<div className="space-y-4">[\s\S]*?(?=<\/div>\n            <\/div>)/,
  donutChartCode
);


fs.writeFileSync('client/src/pages/dashboard/DashboardPage.tsx', content);
