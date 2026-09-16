import mongoose, { Document, Schema } from 'mongoose';

export interface IWaitlist extends Document {
  organizationId: mongoose.Types.ObjectId;
  outletId: mongoose.Types.ObjectId;
  customerName: string;
  mobileNumber: string;
  guests: number;
  estimatedWaitTime: number; // in minutes
  status: 'WAITING' | 'NOTIFIED' | 'SEATED' | 'LEFT';
  createdAt: Date; // Treated as "Waiting Since"
  updatedAt: Date;
}

const waitlistSchema = new Schema<IWaitlist>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    outletId: { type: Schema.Types.ObjectId, ref: 'Outlet', required: true, index: true },
    customerName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    guests: { type: Number, required: true, min: 1 },
    estimatedWaitTime: { type: Number, default: 15 },
    status: {
      type: String,
      enum: ['WAITING', 'NOTIFIED', 'SEATED', 'LEFT'],
      default: 'WAITING'
    }
  },
  { timestamps: true }
);

waitlistSchema.index({ outletId: 1, status: 1 });

export default mongoose.model<IWaitlist>('Waitlist', waitlistSchema);
