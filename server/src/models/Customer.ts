import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  phone?: string;
  email?: string;
  
  // CRM & Metrics
  totalSpent: number;
  visitCount: number;
  lastVisit?: Date;
  
  // Loyalty
  loyaltyPoints: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  
  // Personalization
  birthDate?: Date;
  anniversaryDate?: Date;
  tags: string[];
  
  address?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    phone: { type: String, index: true },
    email: { type: String },
    
    totalSpent: { type: Number, default: 0, min: 0 },
    visitCount: { type: Number, default: 0, min: 0 },
    lastVisit: { type: Date },
    
    loyaltyPoints: { type: Number, default: 0, min: 0 },
    tier: { type: String, enum: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'], default: 'BRONZE' },
    
    birthDate: { type: Date },
    anniversaryDate: { type: Date },
    tags: [{ type: String }],
    
    address: { type: String },
  },
  { timestamps: true }
);

// Auto-tiering based on totalSpent (pre-save middleware could do this, but we'll handle in controllers)
export default mongoose.model<ICustomer>('Customer', customerSchema);
