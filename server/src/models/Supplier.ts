import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplier extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
  paymentTerms?: string;
  outstandingBalance: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const supplierSchema = new Schema<ISupplier>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    contactPerson: { type: String },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    gstNumber: { type: String },
    paymentTerms: { type: String },
    outstandingBalance: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ISupplier>('Supplier', supplierSchema);
