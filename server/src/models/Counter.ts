import mongoose, { Schema, Document } from 'mongoose';

export interface ICounter {
  _id: string; // The sequence name, e.g., "orderNumber_ORGANIZATIONID"
  seq: number;
}

const counterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export default mongoose.model<ICounter>('Counter', counterSchema);
