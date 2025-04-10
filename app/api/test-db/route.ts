import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { Business } from '@/models/Business';
import { BusinessDescription } from '@/models/BusinessDescription';

export async function GET() {
  try {
    // Connect to the database
    await connectDB();
    
    // Fetch all business data
    const business = await Business.findOne();
    const businessDescription = await BusinessDescription.findOne();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        business: business || null,
        businessDescription: businessDescription || null
      }
    });
  } catch (error) {
    console.error('Error testing database connection:', error);
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 