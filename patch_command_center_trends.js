const fs = require('fs');
let content = fs.readFileSync('server/src/controllers/commandCenter.controller.ts', 'utf8');

// Insert salesTrend logic right after categorySales
const trendLogic = `
    // Sales Trend (Hourly if Today/Yesterday, Daily otherwise)
    const salesTrend: any[] = [];
    if (filter === 'today' || filter === 'yesterday') {
      // Hourly grouping
      const hourlyData: any = {};
      for(let i=0; i<24; i++) hourlyData[i] = 0;
      currentOrders.forEach(o => {
        if(o.status === 'PAID' || o.paymentStatus === 'PAID') {
          const hour = new Date(o.createdAt).getHours();
          hourlyData[hour] += o.grandTotal || o.totalAmount || 0;
        }
      });
      for(let i=0; i<24; i++) {
        salesTrend.push({ name: \`\${i}:00\`, sales: hourlyData[i] });
      }
    } else {
      // Daily grouping
      const dailyData: any = {};
      currentOrders.forEach(o => {
        if(o.status === 'PAID' || o.paymentStatus === 'PAID') {
          const dateStr = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          dailyData[dateStr] = (dailyData[dateStr] || 0) + (o.grandTotal || o.totalAmount || 0);
        }
      });
      Object.keys(dailyData).forEach(k => salesTrend.push({ name: k, sales: dailyData[k] }));
    }
`;

content = content.replace(
  "// 6. AI Insights (Rule-based generation)",
  trendLogic + "\n    // 6. AI Insights (Rule-based generation)"
);

content = content.replace(
  "insights,",
  "insights,\n        salesTrend,"
);

fs.writeFileSync('server/src/controllers/commandCenter.controller.ts', content);
