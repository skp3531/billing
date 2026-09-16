import mongoose, { Schema, Document } from 'mongoose';

interface IOrderItemModifier {
  name: string;
  price: number;
}

interface IOrderItemVariant {
  name: string;
  price: number;
}

export interface IOrderItem {
  _id?: mongoose.Types.ObjectId;
  menuItemId: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  variant?: IOrderItemVariant;
  modifiers?: IOrderItemModifier[];
  itemTotal: number;
  status?: 'PENDING' | 'PREPARED';
  station?: string;
  notes?: string;
}

interface ICustomer {
  name?: string;
  phone?: string;
}

export interface IOrder extends Document {
  priority?: 'NORMAL' | 'HIGH' | 'VIP';
  timeline?: { status: string; timestamp: Date; by?: string; note?: string }[];
  cashierId?: mongoose.Types.ObjectId;
  cashierName?: string;
  organizationId: mongoose.Types.ObjectId;
  outletId: mongoose.Types.ObjectId;
  orderNumber: string;
  tableNumber?: string;
  customer?: ICustomer;
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
  status: 'PENDING' | 'PREPARING' | 'COMPLETED' | 'CANCELLED';
  paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'PENDING' | 'SPLIT';
  splitPayments?: { method: 'CASH' | 'CARD' | 'UPI'; amount: number }[];
  paymentStatus: 'PAID' | 'UNPAID';
  items: IOrderItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  loyaltyPointsUsed?: number;
  grandTotal: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemModifierSchema = new Schema<IOrderItemModifier>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

const orderItemVariantSchema = new Schema<IOrderItemVariant>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

const orderItemSchema = new Schema<IOrderItem>({
  menuItemId: {
    type: Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
  },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  variant: orderItemVariantSchema,
  modifiers: [orderItemModifierSchema],
  itemTotal: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'PREPARED'], default: 'PENDING' },
  station: { type: String },
  notes: { type: String },

});

const customerSchema = new Schema<ICustomer>({
  name: { type: String },
  phone: { type: String },
});

const orderSchema = new Schema<IOrder>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    outletId: {
      type: Schema.Types.ObjectId,
      ref: 'Outlet',
      required: true,
      index: true,
    },
    orderNumber: { type: String, required: true },
    tableNumber: { type: String },
    customer: customerSchema,
    orderType: {
      type: String,
      enum: ['DINE_IN', 'TAKEAWAY', 'DELIVERY'],
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PREPARING', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'CARD', 'UPI', 'PENDING'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['PAID', 'UNPAID'],
      default: 'UNPAID',
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    taxTotal: { type: Number, default: 0 },
    discountTotal: { type: Number, default: 0 },
    loyaltyPointsUsed: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    notes: { type: String },
    priority: { type: String, enum: ['NORMAL', 'HIGH', 'VIP'], default: 'NORMAL' },
    timeline: [{ status: String, timestamp: { type: Date, default: Date.now }, by: String, note: String }],
    cashierId: { type: Schema.Types.ObjectId, ref: 'User' },
    cashierName: { type: String },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness of orderNumber per organization/outlet combination
orderSchema.index({ organizationId: 1, outletId: 1, orderNumber: 1 }, { unique: true });

// Compound index for analytics heavy aggregations
orderSchema.index({ organizationId: 1, createdAt: 1, status: 1 });

export default mongoose.model<IOrder>('Order', orderSchema);
