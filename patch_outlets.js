const fs = require('fs');
let content = fs.readFileSync('client/src/pages/outlets/OutletsPage.tsx', 'utf8');

// interface
content = content.replace(
  "gstin: string;",
  "gstin: string;\n  taxRate: number;"
);

// defaultForm
content = content.replace(
  "name: '', code: '', invoicePrefix: '', phone: '', gstin: '',",
  "name: '', code: '', invoicePrefix: '', phone: '', gstin: '', taxRate: 5,"
);

// Form UI
const formMarkup = `<div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                <input required type="text" value={form.gstin} onChange={e => setForm({ ...form, gstin: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
              </div>`;

const newFormMarkup = `<div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                <input required type="text" value={form.gstin} onChange={e => setForm({ ...form, gstin: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                <input required type="number" step="0.1" value={form.taxRate} onChange={e => setForm({ ...form, taxRate: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2" />
              </div>`;

content = content.replace(formMarkup, newFormMarkup);

// Table UI
content = content.replace(
  "<th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">Contact</th>",
  "<th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">Contact</th>\n              <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">Tax %</th>"
);
content = content.replace(
  "<td className=\"px-6 py-4 whitespace-nowrap text-sm text-gray-500\">{outlet.phone || 'N/A'}</td>",
  "<td className=\"px-6 py-4 whitespace-nowrap text-sm text-gray-500\">{outlet.phone || 'N/A'}</td>\n                  <td className=\"px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold\">{outlet.taxRate || 5}%</td>"
);

fs.writeFileSync('client/src/pages/outlets/OutletsPage.tsx', content);
