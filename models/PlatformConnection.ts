import mongoose, { Document } from 'mongoose';

export type PlatformType = 'google' | 'facebook' | 'instagram' | 'firmy';

interface IPlatformConnection extends Document {
  userId: string;
  platform: PlatformType;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  platformBusinessId: string;
  lastSyncedAt?: Date;
  isActive: boolean;
}

const PlatformConnectionSchema = new mongoose.Schema<IPlatformConnection>({
  userId: { type: String, required: true },
  platform: { type: String, required: true, enum: ['google', 'facebook', 'instagram', 'firmy'] },
  accessToken: { type: String, required: true },
  refreshToken: { type: String },
  tokenExpiresAt: { type: Date },
  platformBusinessId: { type: String, required: true },
  lastSyncedAt: { type: Date },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Index for efficient queries
PlatformConnectionSchema.index({ userId: 1, platform: 1 }, { unique: true });

const PlatformConnection = (mongoose.models.PlatformConnection as mongoose.Model<IPlatformConnection>) ||
  mongoose.model<IPlatformConnection>('PlatformConnection', PlatformConnectionSchema);

export { PlatformConnection };