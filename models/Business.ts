import mongoose, { Document } from 'mongoose';

// Define interface for Business document
export interface IBusiness extends Document {
  name: string;
  description: string;
  platformVariants?: Record<string, string>;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  contact?: {
    phone: string;
    email: string;
    website: string;
  };
  categories?: string[];
  userId: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BusinessSchema = new mongoose.Schema<IBusiness>({
  name: { type: String, required: false, trim: true },
  description: { type: String, default: '', required: false, trim: true },
  platformVariants: { type: Map, of: String, default: {}, required: false },
  address: {
    street: { type: String, required: false, trim: true },
    city: { type: String, required: false, trim: true },
    state: { type: String, required: false, trim: true },
    postalCode: { type: String, required: false, trim: true },
    country: { type: String, required: false, trim: true }
  },
  contact: {
    phone: { type: String, required: false, trim: true },
    email: { type: String, required: false, trim: true },
    website: { type: String, required: false, trim: true }
  },
  categories: [{ type: String, required: false }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true,
  strict: false, // Allow flexible schema during development
  collection: 'businesses'
});

// Add pre-save middleware for debugging
BusinessSchema.pre('save', function (next) {
  console.log('Pre-save Business document:', this);
  next();
});

// Add pre-findOneAndUpdate middleware for debugging
BusinessSchema.pre('findOneAndUpdate', function () {
  console.log('Pre-update Business query:', this.getQuery());
  console.log('Pre-update Business update:', this.getUpdate());
});

const Business = (mongoose.models.Business as mongoose.Model<IBusiness>) ||
  mongoose.model<IBusiness>('Business', BusinessSchema);

export { Business };