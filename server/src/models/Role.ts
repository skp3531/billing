import mongoose, { Schema, Document } from 'mongoose';
import { PERMISSIONS } from '../utils/permissions';

export interface IRole extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true },
    permissions: [{ type: String, enum: Object.values(PERMISSIONS) }],
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true }
);

RoleSchema.index({ organizationId: 1, name: 1 }, { unique: true });

export const Role = mongoose.model<IRole>('Role', RoleSchema);
