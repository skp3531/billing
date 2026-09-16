import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
  // Brand & General
  name: string;
  brandName?: string;
  logo?: string;
  favicon?: string;
  phone?: string;
  email: string;
  website?: string;
  socialLinks?: { facebook?: string; instagram?: string };
  
  // Compliance & Legal
  gstin?: string;
  fssaiNumber?: string;
  panNumber?: string;
  cinNumber?: string;
  
  // Location
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    latitude?: number;
    longitude?: number;
  };
  
  // Billing & Receipts
  billing?: {
    invoicePrefix?: string;
    autoNumbering?: boolean;
    financialYearReset?: boolean;
    receiptHeader?: string;
    receiptFooter?: string;
    thankYouMessage?: string;
    termsConditions?: string;
    showQrCode?: boolean;
    printSize?: '58mm' | '80mm' | 'A4';
  };
  
  // KOT & Kitchen
  kitchen?: {
    kotPrefix?: string;
    autoPrint?: boolean;
    kitchenRouting?: boolean;
  };
  
  // Orders & Tables
  operations?: {
    tablePrefix?: string;
    dineInEnabled?: boolean;
    takeawayEnabled?: boolean;
    deliveryEnabled?: boolean;
    qrOrderEnabled?: boolean;
    allowNegativeStock?: boolean;
    maxCashierDiscount?: number;
    maxManagerDiscount?: number;
  };
  
  // Integration Keys
  integrations?: {
    razorpayKey?: string;
    razorpaySecret?: string;
    zomatoId?: string;
    swiggyId?: string;
  };

  active: boolean;
  
  // System Health
  lastBackupDate?: Date;
  subscriptionPlan?: string;
  subscriptionExpiry?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema(
  {
    name: { type: String, required: true },
    brandName: { type: String },
    logo: { type: String },
    favicon: { type: String },
    phone: { type: String },
    email: { type: String, required: true, unique: true },
    website: { type: String },
    socialLinks: { facebook: String, instagram: String },
    
    gstin: { type: String },
    fssaiNumber: { type: String },
    panNumber: { type: String },
    cinNumber: { type: String },
    
    address: {
      street: String,
      city: String,
      state: String,
      country: { type: String, default: 'India' },
      pincode: String,
      latitude: Number,
      longitude: Number,
    },
    
    billing: {
      invoicePrefix: { type: String, default: 'INV' },
      autoNumbering: { type: Boolean, default: true },
      financialYearReset: { type: Boolean, default: true },
      receiptHeader: String,
      receiptFooter: String,
      thankYouMessage: { type: String, default: 'Thank you for your visit!' },
      termsConditions: String,
      showQrCode: { type: Boolean, default: false },
      printSize: { type: String, enum: ['58mm', '80mm', 'A4'], default: '80mm' }
    },
    
    kitchen: {
      kotPrefix: { type: String, default: 'KOT' },
      autoPrint: { type: Boolean, default: true },
      kitchenRouting: { type: Boolean, default: false }
    },
    
    operations: {
      tablePrefix: { type: String, default: 'T' },
      dineInEnabled: { type: Boolean, default: true },
      takeawayEnabled: { type: Boolean, default: true },
      deliveryEnabled: { type: Boolean, default: true },
      qrOrderEnabled: { type: Boolean, default: false },
      allowNegativeStock: { type: Boolean, default: false },
      maxCashierDiscount: { type: Number, default: 5 },
      maxManagerDiscount: { type: Number, default: 20 },
    },
    
    integrations: {
      razorpayKey: String,
      razorpaySecret: String,
      zomatoId: String,
      swiggyId: String
    },
    
    active: { type: Boolean, default: true },
    
    lastBackupDate: { type: Date },
    subscriptionPlan: { type: String, default: 'PRO_YEARLY' },
    subscriptionExpiry: { type: Date }
  },
  { timestamps: true }
);

export const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema);
