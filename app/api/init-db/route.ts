import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';

// This route initializes the database connection
export async function GET() {
  try {
    await connectDB();
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully'
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    
    // Give more specific error messages based on the error
    let message = 'Failed to initialize database';
    let details = '';
    
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        message = 'Could not connect to MongoDB server';
        details = 'Please ensure MongoDB is running on your machine.';
      } else if (error.message.includes('MONGODB_URI')) {
        message = 'MongoDB URI configuration issue';
        details = 'Check your .env.local file for a valid MONGODB_URI.';
      }
    }
    
    return NextResponse.json({
      success: false, 
      message,
      details,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 