import mongoose, { Schema, Document } from 'mongoose';

export interface IExpenseCategory extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  parentCategoryId?: mongoose.Types.ObjectId; // For Subcategories
  type: 'FIXED' | 'VARIABLE';
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const expenseCategorySchema = new Schema<IExpenseCategory>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true },
    parentCategoryId: { type: Schema.Types.ObjectId, ref: 'ExpenseCategory' },
    type: { type: String, enum: ['FIXED', 'VARIABLE'], default: 'VARIABLE' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IExpenseCategory>('ExpenseCategory', expenseCategorySchema);
