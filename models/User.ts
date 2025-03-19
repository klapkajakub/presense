import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser {
  username: string
  email: string
  password: string
  avatar?: {
    url: string
  }
  displayName?: string
  bio?: string
  createdAt: Date
  lastLogin?: Date
}

const userSchema = new mongoose.Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false, // Don't include password in queries by default
  },
  avatar: {
    url: String,
  },
  displayName: String,
  bio: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: Date,
})

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    throw error
  }
}

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema) 