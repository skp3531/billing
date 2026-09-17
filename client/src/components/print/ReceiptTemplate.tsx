import React from 'react';
import { Order } from '../../types';
import { PrinterSetting } from '../../api/printer.api';

interface ReceiptTemplateProps {
  order: Order | null;
  settings: PrinterSetting | null;
  organizationName?: string;
}

export const ReceiptTemplate: React.FC<ReceiptTemplateProps> = ({ order, settings, organizationName }) => {
  if (!order || !settings) return null;

  const widthClass = settings.paperSize === '58mm' ? 'w-[58mm]' : 'w-[80mm]';

  return (
    <div id="print-root" className={`${widthClass} bg-white text-black text-xs font-mono p-2 mx-auto`}>
      <div className="text-center mb-4 border-b border-black pb-2">
        <h1 className="text-lg font-bold">{organizationName || 'Restaurant'}</h1>
        {settings.headerText && <p className="whitespace-pre-wrap mt-1">{settings.headerText}</p>}
      </div>

      <div className="mb-4 space-y-1">
        <p>Order #: {order.orderNumber}</p>
        <p>Date: {new Date(order.createdAt).toLocaleString()}</p>
        <p>Type: {order.orderType}</p>
        {order.customer && <p>Customer: {order.customer.name}</p>}
      </div>

      <table className="w-full mb-4">
        <thead>
          <tr className="border-b border-black text-left">
            <th className="pb-1 w-1/2">Item</th>
            <th className="pb-1 text-center">Qty</th>
            <th className="pb-1 text-right">Amt</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-300">
          {order.items.map((item: any, idx: number) => (
            <tr key={idx}>
              <td className="py-2 pr-2">
                <p className="font-bold">{item.menuItem?.name || 'Item'}</p>
                {item.modifiers?.length > 0 && (
                  <p className="text-[10px] text-gray-600">
                    {item.modifiers.map((m: any) => m.name).join(', ')}
                  </p>
                )}
              </td>
              <td className="py-2 text-center align-top">{item.quantity}</td>
              <td className="py-2 text-right align-top">₹{item.subtotal}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t border-black pt-2 space-y-1">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{order.subtotal}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>₹{order.taxTotal}</span>
        </div>
        {order.discountTotal > 0 && (
          <div className="flex justify-between font-bold">
            <span>Discount</span>
            <span>-₹{order.discountTotal}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-bold mt-2 pt-2 border-t border-black border-dashed">
          <span>Total</span>
          <span>₹{order.grandTotal}</span>
        </div>
      </div>

      <div className="mt-4 pt-2 border-t border-black text-center">
        {settings.footerText && <p className="whitespace-pre-wrap">{settings.footerText}</p>}
        <p className="mt-2 text-[10px]">Powered by Sphere POS</p>
      </div>
    </div>
  );
};
