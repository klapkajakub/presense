import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { User, IUser } from '@/models/User';
import { connectDB } from './database';

// Cookie name for auth
const AUTH_COOKIE = 'presense_auth';

// Token expiry time (7 days)
const TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000;

export interface UserSession {
  userId: string;
  email: string;
}

// Set auth cookie
export function setAuthCookie(userId: string, email: string) {
  const expires = new Date();
  expires.setTime(expires.getTime() + TOKEN_EXPIRY);
  
  const cookieValue = Buffer.from(JSON.stringify({
    userId,
    email,
    exp: expires.getTime()
  })).toString('base64');
  
  cookies().set({
    name: AUTH_COOKIE,
    value: cookieValue,
    expires,
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
}

// Clear auth cookie
export function clearAuthCookie() {
  cookies().set({
    name: AUTH_COOKIE,
    value: '',
    expires: new Date(0),
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
}

// Get user session from cookie
export function getUserSession(): UserSession | null {
  try {
    const authCookie = cookies().get(AUTH_COOKIE);
    
    if (!authCookie) {
      return null;
    }
    
    const sessionData = JSON.parse(
      Buffer.from(authCookie.value, 'base64').toString()
    );
    
    // Check if token is expired
    if (sessionData.exp < Date.now()) {
      clearAuthCookie();
      return null;
    }
    
    return {
      userId: sessionData.userId,
      email: sessionData.email
    };
  } catch (error) {
    console.error('Error getting user session:', error);
    return null;
  }
}

// Get user session from request
export function getUserFromRequest(request: NextRequest): UserSession | null {
  try {
    const authCookie = request.cookies.get(AUTH_COOKIE);
    
    if (!authCookie) {
      return null;
    }
    
    const sessionData = JSON.parse(
      Buffer.from(authCookie.value, 'base64').toString()
    );
    
    // Check if token is expired
    if (sessionData.exp < Date.now()) {
      return null;
    }
    
    return {
      userId: sessionData.userId,
      email: sessionData.email
    };
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
}

// Get current user (full user object)
export async function getCurrentUser(): Promise<IUser | null> {
  try {
    const session = getUserSession();
    
    if (!session) {
      return null;
    }
    
    await connectDB();
    
    const user = await User.findById(session.userId).select('-password');
    
    if (!user) {
      clearAuthCookie();
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
} 