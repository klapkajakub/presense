import mongoose, { Document } from 'mongoose';

// Define interface extending Document for proper typing
export interface IBusinessDescription extends Document {
        descriptions: {
                google: string;
                facebook: string;
                firmy: string;
                instagram: string;
        };
        userId: mongoose.Schema.Types.ObjectId;
        updatedAt: Date;
        createdAt: Date;
}

// Maximum length constants
const MAX_DESCRIPTION_LENGTH = {
        google: 750,
        facebook: 1000,
        firmy: 500,
        instagram: 150
};

const BusinessDescriptionSchema = new mongoose.Schema<IBusinessDescription>({
        descriptions: {
                google: { 
                        type: String, 
                        default: '', 
                        required: false,
                        maxlength: [MAX_DESCRIPTION_LENGTH.google, `Google description cannot exceed ${MAX_DESCRIPTION_LENGTH.google} characters`],
                        trim: true
                },
                facebook: { 
                        type: String, 
                        default: '', 
                        required: false,
                        maxlength: [MAX_DESCRIPTION_LENGTH.facebook, `Facebook description cannot exceed ${MAX_DESCRIPTION_LENGTH.facebook} characters`],
                        trim: true
                },
                firmy: { 
                        type: String, 
                        default: '', 
                        required: false,
                        maxlength: [MAX_DESCRIPTION_LENGTH.firmy, `Firmy description cannot exceed ${MAX_DESCRIPTION_LENGTH.firmy} characters`],
                        trim: true
                },
                instagram: { 
                        type: String, 
                        default: '', 
                        required: false,
                        maxlength: [MAX_DESCRIPTION_LENGTH.instagram, `Instagram description cannot exceed ${MAX_DESCRIPTION_LENGTH.instagram} characters`], 
                        trim: true
                }
        },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
        timestamps: true,
        collection: 'businessDescriptions'
});

// Pre-validate middleware for sanitization
BusinessDescriptionSchema.pre('validate', function (next) {
        // Sanitize descriptions by removing excessive whitespace
        if (this.descriptions) {
                Object.keys(this.descriptions).forEach(key => {
                        const platform = key as keyof IBusinessDescription['descriptions'];
                        if (this.descriptions[platform]) {
                                this.descriptions[platform] = this.descriptions[platform].trim();
                        }
                });
        }
        next();
});

// Ensure model is only created once
const BusinessDescription = (mongoose.models.BusinessDescription as mongoose.Model<IBusinessDescription>) ||
        mongoose.model<IBusinessDescription>('BusinessDescription', BusinessDescriptionSchema);

export { BusinessDescription, MAX_DESCRIPTION_LENGTH };