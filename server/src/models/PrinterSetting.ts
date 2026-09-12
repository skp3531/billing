import mongoose, { Schema, Document } from 'mongoose';

export interface IPrinterSetting extends Document {
  organizationId: mongoose.Types.ObjectId;
  outletId: mongoose.Types.ObjectId;
  type: 'RECEIPT' | 'KOT';
  paperSize: '58mm' | '80mm';
  headerText?: string;
  footerText?: string;
  showLogo: boolean;
  printCopies: number;
  theme?: string;
  createdAt: Date;
  updatedAt: Date;
}

const printerSettingSchema = new Schema<IPrinterSetting>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    outletId: { type: Schema.Types.ObjectId, ref: 'Outlet', required: true, index: true },
    type: { type: String, enum: ['RECEIPT', 'KOT'], required: true },
    paperSize: { type: String, enum: ['58mm', '80mm'], default: '80mm' },
    headerText: { type: String },
    footerText: { type: String },
    showLogo: { type: Boolean, default: false },
    printCopies: { type: Number, default: 1 },
    theme: { type: String, default: 'standard' },
  },
  { timestamps: true }
);

// Ensure one configuration per type per outlet
printerSettingSchema.index({ outletId: 1, type: 1 }, { unique: true });

export default mongoose.model<IPrinterSetting>('PrinterSetting', printerSettingSchema);
