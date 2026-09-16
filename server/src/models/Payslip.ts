import mongoose, { Schema, Document } from 'mongoose';

export interface IPayslip extends Document {
  organizationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  month: number;
  year: number;
  
  // Earnings
  basicPay: number;
  hra: number;
  allowances: number;
  overtimePay: number;
  bonus: number;
  
  // Deductions
  pfDeduction: number;
  esiDeduction: number;
  taxDeduction: number;
  loanDeduction: number;
  unpaidLeaveDeduction: number;
  
  grossSalary: number;
  netSalary: number;
  
  status: 'DRAFT' | 'APPROVED' | 'PAID';
  paymentDate?: Date;
  paymentMethod?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const PayslipSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    
    basicPay: { type: Number, default: 0 },
    hra: { type: Number, default: 0 },
    allowances: { type: Number, default: 0 },
    overtimePay: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    
    pfDeduction: { type: Number, default: 0 },
    esiDeduction: { type: Number, default: 0 },
    taxDeduction: { type: Number, default: 0 },
    loanDeduction: { type: Number, default: 0 },
    unpaidLeaveDeduction: { type: Number, default: 0 },
    
    grossSalary: { type: Number, default: 0 },
    netSalary: { type: Number, default: 0 },
    
    status: { type: String, enum: ['DRAFT', 'APPROVED', 'PAID'], default: 'DRAFT' },
    paymentDate: Date,
    paymentMethod: String,
  },
  { timestamps: true }
);

export const Payslip = mongoose.model<IPayslip>('Payslip', PayslipSchema);
