import mongoose, { Document, Schema } from 'mongoose';

export interface ITable extends Document {
  rotation?: number;
  width?: number;
  height?: number;
  assignedWaiterId?: mongoose.Types.ObjectId;
  guestsSeated?: number;
  occupiedSince?: Date;
  linkedOrderIds?: mongoose.Types.ObjectId[];
  floorPlan?: string;
  shape?: 'square' | 'rectangle' | 'circle';
  positionX?: number;
  positionY?: number;
  currentOrderId?: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  outletId?: mongoose.Types.ObjectId;
  name: string; // or number
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'BILLING_PENDING' | 'CLEANING' | 'DISABLED';
  createdAt: Date;
  updatedAt: Date;
}

const tableSchema = new Schema<ITable>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    outletId: {
      type: Schema.Types.ObjectId,
      ref: 'Outlet',
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      default: 4,
    },
    floorPlan: { type: String, default: 'Main Dining' },
    shape: { type: String, enum: ['square', 'rectangle', 'circle'], default: 'square' },
    positionX: { type: Number, default: 0 },
    positionY: { type: Number, default: 0 },
    rotation: { type: Number, default: 0 },
    width: { type: Number, default: 80 },
    height: { type: Number, default: 80 },
    assignedWaiterId: { type: Schema.Types.ObjectId, ref: 'User' },
    guestsSeated: { type: Number, default: 0 },
    occupiedSince: { type: Date },
    linkedOrderIds: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
    currentOrderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    status: {
      type: String,
      enum: ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'BILLING_PENDING', 'CLEANING', 'DISABLED'],
      default: 'AVAILABLE',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique table names within an organization/outlet
tableSchema.index({ organizationId: 1, outletId: 1, name: 1 }, { unique: true });

export default mongoose.model<ITable>('Table', tableSchema);
