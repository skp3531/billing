import mongoose, { Schema, Document } from 'mongoose';

export interface IOutlet extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  phone?: string;
  gstin?: string;
  invoicePrefix?: string;
  active: boolean;
  isKitchenKotActive: boolean;
  isTableManagementActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OutletSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    phone: String,
    gstin: String,
    invoicePrefix: { type: String, maxlength: 5 },
    active: { type: Boolean, default: true },
    isKitchenKotActive: { type: Boolean, default: true },
    isTableManagementActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

OutletSchema.index({ organizationId: 1, code: 1 }, { unique: true });

export const Outlet = mongoose.model<IOutlet>('Outlet', OutletSchema);
