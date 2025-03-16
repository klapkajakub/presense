import mongoose, { Document } from 'mongoose';

// Define interface extending Document for proper typing
interface IBusinessDescription extends Document {
        descriptions: {
                google: string;
                facebook: string;
                firmy: string;
                instagram: string;
        }
}

const BusinessDescriptionSchema = new mongoose.Schema<IBusinessDescription>({
        descriptions: {
                google: { type: String, default: '', required: false }, // Remove required for testing
                facebook: { type: String, default: '', required: false },
                firmy: { type: String, default: '', required: false },
                instagram: { type: String, default: '', required: false }
        }
}, {
        timestamps: true,
        strict: false, // Allow flexible schema during development
        collection: 'businessDescriptions'
});

// Add pre-save middleware for debugging
BusinessDescriptionSchema.pre('save', function (next) {
        console.log('Pre-save document:', this);
        next();
});

// Add pre-findOneAndUpdate middleware for debugging
BusinessDescriptionSchema.pre('findOneAndUpdate', function () {
        console.log('Pre-update query:', this.getQuery());
        console.log('Pre-update update:', this.getUpdate());
});

const BusinessDescription = (mongoose.models.BusinessDescription as mongoose.Model<IBusinessDescription>) ||
        mongoose.model<IBusinessDescription>('BusinessDescription', BusinessDescriptionSchema);

export { BusinessDescription };