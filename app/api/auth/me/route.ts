import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { User } from '@/models/User';

// Auth cookie name
const AUTH_COOKIE = 'presense_auth';

export async function GET(request: NextRequest) {
  try {
    // Get cookie
    const authCookie = request.cookies.get(AUTH_COOKIE);
    
    if (!authCookie) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Parse cookie
    let sessionData;
    try {
      sessionData = JSON.parse(
        Buffer.from(authCookie.value, 'base64').toString()
      );
      
      // Check if token is expired
      if (sessionData.exp < Date.now()) {
        return NextResponse.json(
          { success: false, message: 'Session expired' },
          { status: 401 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid session' },
        { status: 401 }
      );
    }
    
    // Get user from database
    await connectDB();
    const user = await User.findById(sessionData.userId).select('-password').lean();
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to get user', 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 