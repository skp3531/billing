import React from 'react';
import { Order, Organization } from '../../types';
import { PrinterSetting } from '../../api/printer.api';
import { format } from 'date-fns';

interface ReceiptTemplateProps {
  order: Order;
  organization: Organization;
  settings: PrinterSetting;
}

const ReceiptTemplate: React.FC<ReceiptTemplateProps> = ({ order, organization, settings }) => {
  const is58 = settings.paperSize === '58mm';
  const widthClass = is58 ? 'w-[58mm]' : 'w-[80mm]';
  const textClass = is58 ? 'text-xs' : 'text-sm';

  return (
    <div id="printable-receipt" className={`${widthClass} bg-white text-black p-2 font-mono ${textClass} mx-auto`}>
      <div className="text-center mb-4">
        {settings.showLogo && (
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 border-2 border-black rounded-full flex items-center justify-center font-bold">
              {organization.name.substring(0, 2).toUpperCase()}
            </div>
          </div>
        )}
        <h2 className={`font-bold ${is58 ? 'text-sm' : 'text-base'} uppercase`}>{organization.name}</h2>
        <p>{organization.address?.street}</p>
        <p>{organization.address?.city}, {organization.address?.state}</p>
        <p>Ph: {organization.phone}</p>
        {organization.gstin && <p>GSTIN: {organization.gstin}</p>}
      </div>

      {settings.headerText && (
        <div className="text-center mb-4 whitespace-pre-wrap border-b border-dashed border-black pb-2">
          {settings.headerText}
        </div>
      )}

      <div className="mb-4 space-y-1 border-b border-dashed border-black pb-2">
        <p>Receipt No: {order.orderNumber}</p>
        <p>Date: {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}</p>
        <p>Type: {order.orderType?.replace('_', ' ') || order.type?.replace('_', ' ')}</p>
        {(order.customer?.name || order.customer?.phone) && (
          <p>Customer: {order.customer.name} {order.customer.phone}</p>
        )}
      </div>

      <table className="w-full mb-4">
        <thead>
          <tr className="border-b border-dashed border-black text-left">
            <th className="py-1">Item</th>
            <th className="py-1 text-center">Qty</th>
            <th className="py-1 text-right">Amt</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => (
            <tr key={idx}>
              <td className="py-1">
                <div>{item.name}</div>
                {item.variant && <div className="text-[10px] ml-2">- {typeof item.variant === 'string' ? item.variant : item.variant.name}</div>}
                {item.modifiers?.map(m => (
                  <div key={m.name} className="text-[10px] ml-2">+ {m.name}</div>
                ))}
              </td>
              <td className="py-1 text-center align-top">{item.quantity}</td>
              <td className="py-1 text-right align-top">{(item.itemTotal || item.subtotal || (item.unitPrice * item.quantity)).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t border-dashed border-black pt-2 mb-4 space-y-1">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{order.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax:</span>
          <span>{order.taxTotal.toFixed(2)}</span>
        </div>
        {order.discountTotal > 0 && (
          <div className="flex justify-between">
            <span>Discount:</span>
            <span>-{order.discountTotal.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-base mt-1 pt-1 border-t border-black">
          <span>Total:</span>
          <span>{order.grandTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="text-center border-t border-dashed border-black pt-4">
        {settings.footerText ? (
          <div className="whitespace-pre-wrap">{settings.footerText}</div>
        ) : (
          <div>Thank you for visiting!</div>
        )}
        <div className="mt-4 text-[10px]">Powered by RestoPOS</div>
      </div>
    </div>
  );
};

export default ReceiptTemplate;
