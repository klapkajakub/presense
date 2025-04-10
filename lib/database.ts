import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || ''

// Validate MONGODB_URI
function validateMongoDbUri(uri: string): boolean {
  if (!uri) return false;
  
  // Basic validation - should start with mongodb:// or mongodb+srv://
  return uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://');
}

if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not set');
  // We'll throw this error in the connectDB function
} else if (!validateMongoDbUri(MONGODB_URI)) {
  console.error('MONGODB_URI environment variable is not a valid MongoDB URI');
  // We'll throw this error in the connectDB function
}

// Global connection object to track connection state
const connection = {
  isConnected: 0
}

// Connection options with sensible defaults
const connectionOptions = {
  bufferCommands: false,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  maxPoolSize: 10
}

async function dbConnect() {
  // Return if already connected
  if (connection.isConnected) {
    console.log('Using existing database connection');
    return mongoose.connection;
  }

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }
  
  if (!validateMongoDbUri(MONGODB_URI)) {
    throw new Error('MONGODB_URI environment variable is not a valid MongoDB URI');
  }

  try {
    console.log('Connecting to MongoDB...');
    const db = await mongoose.connect(MONGODB_URI, connectionOptions);
    connection.isConnected = db.connections[0].readyState;
    console.log('Connected to MongoDB');
    
    // Initialize models
    require('@/models/Business');
    require('@/models/BusinessDescription');
    require('@/models/BusinessHours');
    require('@/models/User');
    require('@/models/PlatformConnection');
    
    console.log('Models initialized');
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function connectDB() {
  try {
    return await dbConnect();
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

// Handle connection events for better debugging
mongoose.connection.on('connected', () => console.log('Mongoose connected'));
mongoose.connection.on('error', (err) => console.error('Mongoose connection error:', err));
mongoose.connection.on('disconnected', () => console.log('Mongoose disconnected'));

// Clean up connections when the process terminates
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Mongoose disconnected through app termination');
  process.exit(0);
});