import mongoose, { Schema, Document } from 'mongoose';

export interface IExpenseBudget extends Document {
  organizationId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  amount: number;
  period: 'MONTHLY' | 'YEARLY';
  createdAt: Date;
  updatedAt: Date;
}

const expenseBudgetSchema = new Schema<IExpenseBudget>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'ExpenseCategory', required: true },
    amount: { type: Number, required: true },
    period: { type: String, enum: ['MONTHLY', 'YEARLY'], default: 'MONTHLY' },
  },
  { timestamps: true }
);

export default mongoose.model<IExpenseBudget>('ExpenseBudget', expenseBudgetSchema);
