import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

const connection = {
  isConnected: false
}

async function dbConnect() {
  if (connection.isConnected) {
    return
  }

  const db = await mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  })

  connection.isConnected = !!db.connections[0].readyState
}

export async function connectDB() {
  try {
    if (!MONGODB_URI || MONGODB_URI === '') {
      throw new Error('MONGODB_URI environment variable is not set or is empty')
    }
    await dbConnect()
  } catch (error) {
    console.error('Database connection error:', error)
    throw error
  }
}