import mongoose, { Schema, Document } from 'mongoose';

export interface IReservation extends Document {
  organizationId: mongoose.Types.ObjectId;
  outletId: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone: string;
  partySize: number;
  reservationDate: Date;
  timeSlot: string;
  tableId?: mongoose.Types.ObjectId;
  status: 'PENDING' | 'CONFIRMED' | 'SEATED' | 'CANCELLED' | 'NO_SHOW';
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reservationSchema = new Schema<IReservation>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    outletId: { type: Schema.Types.ObjectId, ref: 'Outlet', required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    partySize: { type: Number, required: true, min: 1 },
    reservationDate: { type: Date, required: true },
    timeSlot: { type: String, required: true }, // e.g. "19:30"
    tableId: { type: Schema.Types.ObjectId, ref: 'Table' },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'SEATED', 'CANCELLED', 'NO_SHOW'],
      default: 'PENDING',
    },
    specialRequests: String,
  },
  { timestamps: true }
);

reservationSchema.index({ organizationId: 1, reservationDate: 1, status: 1 });
export default mongoose.model<IReservation>('Reservation', reservationSchema);
