import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  logo?: string;
  phone?: string;
  email: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  gstin?: string;
  active: boolean;
  modulesEnabled?: { tables: boolean; kitchen: boolean };
  printSize?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema(
  {
    name: { type: String, required: true },
    logo: { type: String },
    phone: { type: String },
    email: { type: String, required: true, unique: true },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    gstin: String,
    active: { type: Boolean, default: true },
    modulesEnabled: {
      tables: { type: Boolean, default: true },
      kitchen: { type: Boolean, default: true },
    },
    printSize: { type: String, enum: ['58mm', '80mm', 'A4'], default: '80mm' },
  },
  { timestamps: true }
);

export const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema);
