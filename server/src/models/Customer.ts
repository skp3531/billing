import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  phone?: string;
  email?: string;
  totalSpent: number;
  loyaltyPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: [0, 'Total spent cannot be negative'],
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
      min: [0, 'Loyalty points cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICustomer>('Customer', customerSchema);
