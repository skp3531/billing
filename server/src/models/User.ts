import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  organizationId: mongoose.Types.ObjectId;
  outletIds: mongoose.Types.ObjectId[];
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  roleId: mongoose.Types.ObjectId;
  active: boolean;
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
    lastLogin: Date,
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);

