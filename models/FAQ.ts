import mongoose, { Schema, Document } from 'mongoose';

export interface IFAQ extends Document {
  businessId: string;
  question: string;
  answer: string;
  createdAt: Date;
  updatedAt: Date;
}

const FAQSchema: Schema = new Schema(
  {
    businessId: { type: String, required: true, index: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { timestamps: true }
);

// Create a compound index for businessId and question to ensure uniqueness
FAQSchema.index({ businessId: 1, question: 1 }, { unique: true });

export default mongoose.models.FAQ || mongoose.model<IFAQ>('FAQ', FAQSchema);