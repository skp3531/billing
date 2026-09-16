const fs = require('fs');
let content = fs.readFileSync('client/src/pages/dashboard/DashboardPage.tsx', 'utf8');

const target = `<div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
               <h2 className="text-lg font-black text-gray-900 mb-4">Payment Methods</h2>
               <div className="space-y-4">
                 {Object.entries(data?.paymentMethods || {}).map(([method, amount]: any) => (
                   <div key={method}>
                     <div className="flex justify-between items-center mb-1">
                       <span className="text-sm font-bold text-gray-700 uppercase">{method}</span>
                       <span className="text-sm font-black text-gray-900">₹{amount.toLocaleString()}</span>
                     </div>
                     <div className="w-full bg-gray-100 rounded-full h-2">
                       <div className="bg-indigo-500 h-2 rounded-full" style={{ width: \`\${Math.min((amount / data?.kpis?.grossSales?.value) * 100, 100)}%\` }}></div>
                     </div>
                   </div>
                 ))}
                 {Object.keys(data?.paymentMethods || {}).length === 0 && <p className="text-sm text-gray-500 italic">No payments received.</p>}
               </div>
            </div>`;

const replacement = `<div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col">
               <h2 className="text-lg font-black text-gray-900 mb-4">Payment Methods</h2>
               <div className="flex-1 flex flex-col justify-center min-h-[200px]">
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
                   <p className="text-sm text-gray-500 italic text-center">No payments received.</p>
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
            </div>`;

content = content.replace(target, replacement);

fs.writeFileSync('client/src/pages/dashboard/DashboardPage.tsx', content);
