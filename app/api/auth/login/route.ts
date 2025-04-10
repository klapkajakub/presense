import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';

// Auth cookie name and expiry
const AUTH_COOKIE = 'presense_auth';
const COOKIE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

interface UserDocument {
  _id: mongoose.Types.ObjectId;
  email: string | undefined;
  name: string | undefined;
  password: string | undefined;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Find user by email
    const user = await User.findOne({ email }).lean() as UserDocument;
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Create cookie data
    const expires = new Date();
    expires.setTime(expires.getTime() + COOKIE_EXPIRY);
    
    const userData = {
      userId: user._id.toString(),
      email: user.email
    };
    
    // Set cookie with user data
    const cookieValue = Buffer.from(JSON.stringify({
      ...userData,
      exp: expires.getTime()
    })).toString('base64');
    
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
    
    // Set cookie
    response.cookies.set({
      name: AUTH_COOKIE,
      value: cookieValue,
      expires,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Login failed', 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 