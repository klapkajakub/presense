import mongoose, { Document } from 'mongoose';

// Define interface for Business document
export interface IBusiness extends Document {
  description: string;
  platformVariants?: Record<string, string>;
  // Add other business fields as needed
}

const BusinessSchema = new mongoose.Schema<IBusiness>({
  description: { type: String, default: '', required: false },
  platformVariants: { type: Map, of: String, default: {}, required: false },
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