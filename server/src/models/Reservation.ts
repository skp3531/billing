import mongoose, { Document, Schema } from 'mongoose';

export interface IReservation extends Document {
  organizationId: mongoose.Types.ObjectId;
  outletId: mongoose.Types.ObjectId;
  customerName: string;
  mobileNumber: string;
  reservationDate: Date;
  reservationTime: string; // HH:mm format
  guests: number;
  seatingPreference?: string;
  notes?: string;
  status: 'BOOKED' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  assignedTableId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const reservationSchema = new Schema<IReservation>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    outletId: { type: Schema.Types.ObjectId, ref: 'Outlet', required: true, index: true },
    customerName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    reservationDate: { type: Date, required: true },
    reservationTime: { type: String, required: true },
    guests: { type: Number, required: true, min: 1 },
    seatingPreference: { type: String },
    notes: { type: String },
    status: {
      type: String,
      enum: ['BOOKED', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
      default: 'BOOKED'
    },
    assignedTableId: { type: Schema.Types.ObjectId, ref: 'Table' }
  },
  { timestamps: true }
);

reservationSchema.index({ outletId: 1, reservationDate: 1 });

export default mongoose.model<IReservation>('Reservation', reservationSchema);
