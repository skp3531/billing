import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  organizationId: mongoose.Types.ObjectId;
  expenseNumber: string;
  categoryId: mongoose.Types.ObjectId; // References ExpenseCategory
  // Legacy support for string categories during migration
  categoryString?: string;
  
  description?: string;
  
  // Financials
  amount: number;
  taxAmount: number;
  totalAmount: number;
  
  // Vendor / GST
  supplierId?: mongoose.Types.ObjectId;
  vendorName?: string;
  invoiceNumber?: string;
  gstin?: string;
  
  // OCR & Files
  receiptUrl?: string;
  
  // Workflow
  date: Date;
  paymentMode: 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER' | 'CHEQUE' | 'PETTY_CASH';
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'PAID';
  
  // Approvals
  submittedBy?: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  
  isRecurring?: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    expenseNumber: { type: String, unique: true, sparse: true }, // unique but optional initially
    
    categoryId: { type: Schema.Types.ObjectId, ref: 'ExpenseCategory' },
    categoryString: { type: String }, // Legacy
    
    description: { type: String },
    
    amount: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    vendorName: { type: String },
    invoiceNumber: { type: String },
    gstin: { type: String },
    
    receiptUrl: { type: String },
    
    date: { type: Date, required: true },
    paymentMode: { 
      type: String, 
      enum: ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'PETTY_CASH'],
      default: 'CASH'
    },
    
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PAID'],
      default: 'PAID'
    },
    
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    
    isRecurring: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Pre-save to auto-generate expenseNumber and totalAmount if needed
expenseSchema.pre('save', async function(next) {
  if (!this.totalAmount) {
    this.totalAmount = this.amount + (this.taxAmount || 0);
  }
  next();
});

export default mongoose.model<IExpense>('Expense', expenseSchema);
