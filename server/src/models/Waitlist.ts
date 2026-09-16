import mongoose, { Schema, Document } from 'mongoose';

export interface IWaitlist extends Document {
  organizationId: mongoose.Types.ObjectId;
  outletId: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone: string;
  partySize: number;
  quotedWaitTime: number; // in minutes
  status: 'WAITING' | 'NOTIFIED' | 'SEATED' | 'LEFT';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const waitlistSchema = new Schema<IWaitlist>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    outletId: { type: Schema.Types.ObjectId, ref: 'Outlet', required: true, index: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    partySize: { type: Number, required: true, min: 1 },
    quotedWaitTime: { type: Number, default: 15 },
    status: {
      type: String,
      enum: ['WAITING', 'NOTIFIED', 'SEATED', 'LEFT'],
      default: 'WAITING',
    },
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model<IWaitlist>('Waitlist', waitlistSchema);
