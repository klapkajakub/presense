import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { connectDB } from '@/lib/db';
import { PlatformConnection } from '@/models/PlatformConnection';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const FB_APP_ID = process.env.FACEBOOK_APP_ID;
const FB_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/platform-connections/facebook/callback`;

async function verifyAuth(request: Request) {
  const token = request.headers.get('Authorization')?.split(' ')[1];
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const scopes = [
      'pages_manage_metadata',
      'pages_read_engagement',
      'pages_manage_posts',
      'pages_show_list'
    ];

    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${FB_APP_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&scope=${encodeURIComponent(scopes.join(','))}` +
      `&state=${payload.userId}`;

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Error generating Facebook auth URL:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

    // Exchange code for access token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `client_id=${FB_APP_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&client_secret=${FB_APP_SECRET}` +
      `&code=${code}`
    );

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token');
    }

    const { access_token, expires_in } = await tokenResponse.json();

    // Get user's Facebook pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${access_token}`
    );

    if (!pagesResponse.ok) {
      throw new Error('Failed to get pages');
    }

    const { data: pages } = await pagesResponse.json();

    if (!pages?.length) {
      return new NextResponse('No business pages found', { status: 400 });
    }

    // Store the connection
    await connectDB();
    await PlatformConnection.findOneAndUpdate(
      { userId: state, platform: 'facebook' },
      {
        accessToken: access_token,
        tokenExpiresAt: new Date(Date.now() + (expires_in * 1000)),
        platformBusinessId: pages[0].id,
        isActive: true
      },
      { upsert: true }
    );

    // Redirect back to the platform connections page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=facebook-connected`);
  } catch (error) {
    console.error('Error handling Facebook callback:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=facebook-connection-failed`);
  }
} 