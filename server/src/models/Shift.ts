import mongoose, { Schema, Document } from 'mongoose';

export interface IShift extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "17:00"
  gracePeriodMinutes: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ShiftSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    gracePeriodMinutes: { type: Number, default: 15 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Shift = mongoose.model<IShift>('Shift', ShiftSchema);
