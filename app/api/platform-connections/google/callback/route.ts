import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createGoogleOAuth2Client } from '@/lib/platforms/google-business';
import { connectDB } from '@/lib/db';
import { PlatformConnection } from '@/models/PlatformConnection';

// Using mock auth for development
async function verifyAuth() {
  // Return mock user payload
  return {
    userId: 'mock-user-id'
  };
}

// Handle OAuth callback from Google
export async function GET(request: NextRequest) {
  try {
    const payload = await verifyAuth();
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.redirect(new URL('/settings?error=missing-code', process.env.NEXT_PUBLIC_APP_URL || ''));
    }
    
    const oauth2Client = createGoogleOAuth2Client();
    
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens || !tokens.access_token) {
      return NextResponse.redirect(new URL('/settings?error=token-exchange-failed', process.env.NEXT_PUBLIC_APP_URL || ''));
    }
    
    // Get user info from Google
    oauth2Client.setCredentials(tokens);
    
    // @ts-ignore - Type issues with Google API client
    const oauth2 = google.oauth2('v2');
    
    const userInfo = await oauth2.userinfo.get({ auth: oauth2Client });
    
    if (!userInfo.data || !userInfo.data.email) {
      return NextResponse.redirect(new URL('/settings?error=user-info-failed', process.env.NEXT_PUBLIC_APP_URL || ''));
    }
    
    await connectDB();
    
    // Check if connection already exists
    const existingConnection = await PlatformConnection.findOne({
      userId: payload.userId,
      platform: 'google',
      platformUserEmail: userInfo.data.email
    });
    
    if (existingConnection) {
      // Update existing connection
      existingConnection.accessToken = tokens.access_token;
      if (tokens.refresh_token) {
        existingConnection.refreshToken = tokens.refresh_token;
      }
      existingConnection.tokenExpiry = tokens.expiry_date ? new Date(tokens.expiry_date) : undefined;
      existingConnection.isActive = true;
      await existingConnection.save();
    } else {
      // Create new connection
      await PlatformConnection.create({
        userId: payload.userId,
        platform: 'google',
        platformUserId: userInfo.data.id,
        platformUserEmail: userInfo.data.email,
        platformUserName: userInfo.data.name,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
        isActive: true
      });
    }
    
    // Redirect back to settings with success
    return NextResponse.redirect(new URL('/settings?success=google-connected', process.env.NEXT_PUBLIC_APP_URL || ''));
    
  } catch (error) {
    console.error('Error handling Google OAuth callback:', error);
    return NextResponse.redirect(new URL(`/settings?error=${encodeURIComponent(error instanceof Error ? error.message : 'unknown-error')}`, process.env.NEXT_PUBLIC_APP_URL || ''));
  }
} 