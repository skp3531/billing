import mongoose, { Schema, Document } from 'mongoose';

export interface IPurchaseItem {
  rawMaterialId: mongoose.Types.ObjectId;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface IPurchase extends Document {
  organizationId: mongoose.Types.ObjectId;
  supplierId: mongoose.Types.ObjectId;
  items: IPurchaseItem[];
  totalAmount: number;
  date: Date;
  status: 'Pending' | 'Completed' | 'Cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const purchaseItemSchema = new Schema<IPurchaseItem>({
  rawMaterialId: { type: Schema.Types.ObjectId, ref: 'RawMaterial', required: true },
  quantity: { type: Number, required: true },
  unitCost: { type: Number, required: true },
  total: { type: Number, required: true },
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
    items: [purchaseItemSchema],
    totalAmount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Cancelled'],
      default: 'Completed',
    },
  },
  { timestamps: true }
);

export default mongoose.model<IPurchase>('Purchase', purchaseSchema);
