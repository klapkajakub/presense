import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { PlatformConnection } from '@/models/PlatformConnection';
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL}/api/platform-connections/google/callback`
);

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const scopes = [
      'https://www.googleapis.com/auth/business.manage',
      'https://www.googleapis.com/auth/plus.business.manage'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: session.user.id // Pass user ID as state for verification
    });

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Error generating Google auth URL:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // This will be the user ID

    if (!code || !state) {
      return new NextResponse('Missing required parameters', { status: 400 });
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user's business locations
    const mybusiness = google.mybusiness('v4');
    const accounts = await mybusiness.accounts.list({
      auth: oauth2Client
    });

    if (!accounts.data.accounts?.length) {
      return new NextResponse('No business accounts found', { status: 400 });
    }

    // Store the connection
    await connectDB();
    await PlatformConnection.findOneAndUpdate(
      { userId: state, platform: 'google' },
      {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiresAt: new Date(Date.now() + (tokens.expiry_date || 3600000)),
        platformBusinessId: accounts.data.accounts[0].name,
        isActive: true
      },
      { upsert: true }
    );

    // Redirect back to the platform connections page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=google-connected`);
  } catch (error) {
    console.error('Error handling Google callback:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=google-connection-failed`);
  }
} 