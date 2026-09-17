import mongoose, { Schema, Document } from 'mongoose';

export interface IPurchaseItem {
  rawMaterialId: mongoose.Types.ObjectId;
  orderedQty: number;
  unitCost: number;
  total: number;
  // GRN Tracking
  receivedQty: number;
  acceptedQty: number;
  damagedQty: number;
  rejectedQty: number;
}

export interface IPurchase extends Document {
  organizationId: mongoose.Types.ObjectId;
  supplierId: mongoose.Types.ObjectId;
  poNumber: string;
  items: IPurchaseItem[];
  
  totalAmount: number;
  taxAmount: number;
  grandTotal: number;
  
  date: Date;
  deliveryDate?: Date;
  
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'ORDERED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
  
  // Invoice & Payment
  invoiceNumber?: string;
  invoiceDate?: Date;
  dueDate?: Date;
  gstDetails?: string;
  paymentTerms?: string;
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
  amountPaid: number;
  
  // Workflow
  requestedBy?: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const purchaseItemSchema = new Schema<IPurchaseItem>({
  rawMaterialId: { type: Schema.Types.ObjectId, ref: 'RawMaterial', required: true },
  orderedQty: { type: Number, required: true },
  unitCost: { type: Number, required: true },
  total: { type: Number, required: true },
  receivedQty: { type: Number, default: 0 },
  acceptedQty: { type: Number, default: 0 },
  damagedQty: { type: Number, default: 0 },
  rejectedQty: { type: Number, default: 0 },
});

const purchaseSchema = new Schema<IPurchase>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
    poNumber: { type: String, required: true, unique: true },
    items: [purchaseItemSchema],
    
    totalAmount: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    
    date: { type: Date, default: Date.now },
    deliveryDate: { type: Date },
    
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ORDERED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'],
      default: 'RECEIVED', // Defaulting to received for backwards compatibility or simple creation
    },
    
    invoiceNumber: { type: String },
    invoiceDate: { type: Date },
    dueDate: { type: Date },
    gstDetails: { type: String },
    paymentTerms: { type: String },
    
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'PARTIAL', 'PAID'],
      default: 'UNPAID',
    },
    amountPaid: { type: Number, default: 0 },
    
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String },
  },
  { timestamps: true }
);

purchaseSchema.index({ organizationId: 1, outletId: 1, purchaseDate: 1, status: 1 });
export default mongoose.model<IPurchase>('Purchase', purchaseSchema);
