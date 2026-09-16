const fs = require('fs');
let content = fs.readFileSync('client/src/pages/orders/components/OrderDetailsDrawer.tsx', 'utf8');

// Add ActionModal import
content = content.replace(
  "import { format } from 'date-fns';",
  "import { format } from 'date-fns';\nimport { ActionModal } from './ActionModal';\nimport { useState } from 'react';"
);

// Add state to component
content = content.replace(
  "export const OrderDetailsDrawer = ({ order, isOpen, onClose, onPrint, onCancel }: OrderDetailsDrawerProps) => {",
  `export const OrderDetailsDrawer = ({ order, isOpen, onClose, onPrint, onCancel }: OrderDetailsDrawerProps) => {
  const [modalType, setModalType] = useState<'REFUND' | 'VOID' | 'CANCEL' | null>(null);

  const handleActionSubmit = (reason: string, authBy: string) => {
    // In a real app, this would call the API
    console.log(\`\${modalType} submitted:\`, { reason, authBy, orderId: order?._id });
    onCancel(order!); // Re-using onCancel for now as a generic action handler to show success
    setModalType(null);
    onClose();
  };`
);

// Add icons
content = content.replace(
  "import { Clock, CheckCircle2, User, Printer, Ban, Receipt } from 'lucide-react';",
  "import { Clock, CheckCircle2, User, Printer, Ban, Receipt, RefreshCcw, HandCoins } from 'lucide-react';"
);

// Update Footer Buttons
const footerOld = `<div className="p-4 bg-gray-50 border-t border-gray-200 grid grid-cols-2 gap-3 shrink-0">
          <button onClick={() => onPrint(order)} className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors">
            <Printer className="w-4 h-4" /> Print Bill
          </button>
          
          {order.status !== 'CANCELLED' && (
            <button onClick={() => onCancel(order)} className="flex items-center justify-center gap-2 py-3 bg-white border border-rose-200 rounded-xl font-bold text-rose-600 hover:bg-rose-50 transition-colors">
              <Ban className="w-4 h-4" /> Cancel Order
            </button>
          )}
        </div>`;

const footerNew = `<div className="p-4 bg-gray-50 border-t border-gray-200 shrink-0">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button onClick={() => onPrint(order)} className="flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors text-sm">
              <Printer className="w-4 h-4" /> Print Bill
            </button>
            <button onClick={() => {}} className="flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors text-sm">
              <RefreshCcw className="w-4 h-4" /> Repeat Order
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {order.status !== 'CANCELLED' && (
              <button onClick={() => setModalType('CANCEL')} className="flex items-center justify-center gap-1.5 py-2 bg-white border border-rose-200 rounded-xl font-bold text-rose-600 hover:bg-rose-50 transition-colors text-xs">
                <Ban className="w-3 h-3" /> Cancel
              </button>
            )}
            {order.status === 'COMPLETED' && (
              <button onClick={() => setModalType('REFUND')} className="flex items-center justify-center gap-1.5 py-2 bg-white border border-amber-200 rounded-xl font-bold text-amber-600 hover:bg-amber-50 transition-colors text-xs">
                <HandCoins className="w-3 h-3" /> Refund
              </button>
            )}
            <button onClick={() => setModalType('VOID')} className="flex items-center justify-center gap-1.5 py-2 bg-white border border-purple-200 rounded-xl font-bold text-purple-600 hover:bg-purple-50 transition-colors text-xs">
               Void
            </button>
          </div>
        </div>`;

content = content.replace(footerOld, footerNew);

// Add ActionModal before closing tags
content = content.replace(
  "      </div>\n    </>\n  );\n};",
  "      </div>\n      <ActionModal \n        isOpen={modalType !== null} \n        onClose={() => setModalType(null)} \n        title={`${modalType} Order`} \n        type={modalType!} \n        onSubmit={handleActionSubmit} \n      />\n    </>\n  );\n};"
);

fs.writeFileSync('client/src/pages/orders/components/OrderDetailsDrawer.tsx', content);
