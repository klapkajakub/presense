import mongoose, { Document } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  email: string
  password: string
  createdAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    console.log('Password not modified, skipping hash')
    return next()
  }
  
  try {
    console.log('Generating salt...')
    const salt = await bcrypt.genSalt(10)
    console.log('Hashing password...')
    this.password = await bcrypt.hash(this.password, salt)
    console.log('Password hashed successfully')
    next()
  } catch (error: any) {
    console.error('Error hashing password:', error)
    next(error)
  }
})

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    console.log('Starting password comparison...')
    if (!this.password) {
      console.error('No password hash stored for user')
      return false
    }
    if (!candidatePassword) {
      console.error('No candidate password provided')
      return false
    }
    const isMatch = await bcrypt.compare(candidatePassword, this.password)
    console.log('Password comparison result:', isMatch)
    return isMatch
  } catch (error) {
    console.error('Password comparison error:', error)
    throw new Error('Password comparison failed')
  }
}

// Delete the model if it exists to prevent OverwriteModelError
if (mongoose.models.User) {
  console.log('Cleaning up existing User model')
  delete mongoose.models.User
}

// Create the model
console.log('Creating User model')
export const User = mongoose.model<IUser>('User', UserSchema) 