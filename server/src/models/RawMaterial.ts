import mongoose, { Schema, Document } from 'mongoose';

export interface IRawMaterial extends Document {
  organizationId: mongoose.Types.ObjectId;
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

export default mongoose.model<IRawMaterial>('RawMaterial', rawMaterialSchema);
