import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  organizationId: mongoose.Types.ObjectId;
  outletId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: Date;
  
  shiftId?: mongoose.Types.ObjectId;
  
  checkIn?: Date;
  checkOut?: Date;
  
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LATE' | 'LEAVE';
  totalWorkingMinutes: number;
  totalBreakMinutes: number;
  overtimeMinutes: number;
  
  approvedBy?: mongoose.Types.ObjectId;
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    outletId: { type: Schema.Types.ObjectId, ref: 'Outlet', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true },
    
    shiftId: { type: Schema.Types.ObjectId, ref: 'Shift' },
    
    checkIn: Date,
    checkOut: Date,
    
    status: { type: String, enum: ['PRESENT', 'ABSENT', 'HALF_DAY', 'LATE', 'LEAVE'], default: 'ABSENT' },
    
    totalWorkingMinutes: { type: Number, default: 0 },
    totalBreakMinutes: { type: Number, default: 0 },
    overtimeMinutes: { type: Number, default: 0 },
    
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: String,
  },
  { timestamps: true }
);

export const Attendance = mongoose.model<IAttendance>('Attendance', AttendanceSchema);
