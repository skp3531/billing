import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  organizationId: mongoose.Types.ObjectId;
  outletIds: mongoose.Types.ObjectId[];
  
  // Core Profile
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  roleId: mongoose.Types.ObjectId;
  active: boolean;
  
  // HR & Employment Details
  department?: 'FRONT_OF_HOUSE' | 'KITCHEN' | 'MANAGEMENT' | 'BACK_OFFICE' | 'DELIVERY';
  designation?: string;
  joiningDate?: Date;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  
  // Payroll
  payrollType?: 'SALARY' | 'HOURLY';
  baseSalary?: number;
  hourlyRate?: number;
  
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    outletIds: [{ type: Schema.Types.ObjectId, ref: 'Outlet' }],
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: String,
    passwordHash: { type: String, required: true, select: false },
    roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: true, index: true },
    active: { type: Boolean, default: true },
    
    department: { type: String, enum: ['FRONT_OF_HOUSE', 'KITCHEN', 'MANAGEMENT', 'BACK_OFFICE', 'DELIVERY'], default: 'FRONT_OF_HOUSE' },
    designation: String,
    joiningDate: Date,
    emergencyContact: {
      name: String,
      phone: String,
      relation: String
    },
    
    payrollType: { type: String, enum: ['SALARY', 'HOURLY'], default: 'SALARY' },
    baseSalary: { type: Number, default: 0 },
    hourlyRate: { type: Number, default: 0 },

    lastLogin: Date,
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
