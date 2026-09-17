import mongoose, { Schema, Document } from 'mongoose';

export interface IRawMaterial extends Document {
  organizationId: mongoose.Types.ObjectId;
  outletId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  unit: string;
  unitCost: number;
  currentStock: number;
  minStockLevel: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const rawMaterialSchema = new Schema<IRawMaterial>(
  {
    outletId: { type: Schema.Types.ObjectId, ref: 'Outlet', index: true },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    description: { type: String },
    unit: { type: String, required: true },
    unitCost: { type: Number, required: true, default: 0 },
    currentStock: { type: Number, required: true, default: 0 },
    minStockLevel: { type: Number, required: true, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

rawMaterialSchema.index({ organizationId: 1, outletId: 1, category: 1 });
export default mongoose.model<IRawMaterial>('RawMaterial', rawMaterialSchema);
