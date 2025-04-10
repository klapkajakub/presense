import { NextRequest, NextResponse } from 'next/server';
import { createGoogleOAuth2Client } from '@/lib/platforms/google-business';

// Using mock auth for development
async function verifyAuth() {
  // Return mock user payload
  return {
    userId: 'mock-user-id'
  };
}

// Generate a Google OAuth URL
export async function GET() {
  try {
    await verifyAuth();
    
    console.log("Attempting to create Google OAuth client...");
    const oauth2Client = createGoogleOAuth2Client();
    
    // Set the appropriate scopes for Google My Business API
    const scopes = [
      'https://www.googleapis.com/auth/business.manage',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];
    
    console.log("Generating Google authorization URL with scopes:", scopes);
    
    // Generate the authorization URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      include_granted_scopes: true
    });
    
    console.log("Generated auth URL:", authUrl);
    
    return NextResponse.json({
      success: true,
      authUrl
    });
    
  } catch (error) {
    console.error('Error generating Google OAuth URL:', error);
    
    // More detailed error information
    const errorDetails = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    };
    
    console.error('Error details:', JSON.stringify(errorDetails, null, 2));
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate Google OAuth URL',
      message: errorDetails.message,
      details: errorDetails
    }, { status: 500 });
  }
} 