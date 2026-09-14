import mongoose, { Schema, Document } from 'mongoose';

export interface ICashRegister extends Document {
  organizationId: mongoose.Types.ObjectId;
  outletId: mongoose.Types.ObjectId;
  openedBy: mongoose.Types.ObjectId;
  openedAt: Date;
  openingBalance: number;
  
  closedBy?: mongoose.Types.ObjectId;
  closedAt?: Date;
  closingBalance?: number;
  expectedBalance?: number;
  difference?: number;
  
  totalCashSales: number;
  totalCashIn: number; // e.g. floating cash added
  totalCashOut: number; // e.g. petty cash expenses paid from drawer
  
  status: 'OPEN' | 'CLOSED';
  notes?: string;
}

const cashRegisterSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    outletId: { type: Schema.Types.ObjectId, ref: 'Outlet', required: true, index: true },
    openedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    openedAt: { type: Date, default: Date.now, required: true },
    openingBalance: { type: Number, required: true, default: 0 },
    
    closedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    closedAt: { type: Date },
    closingBalance: { type: Number },
    expectedBalance: { type: Number },
    difference: { type: Number },
    
    totalCashSales: { type: Number, default: 0 },
    totalCashIn: { type: Number, default: 0 },
    totalCashOut: { type: Number, default: 0 },
    
    status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' },
    notes: { type: String },
  },
  { timestamps: true }
);

export const CashRegister = mongoose.model<ICashRegister>('CashRegister', cashRegisterSchema);
export default CashRegister;
