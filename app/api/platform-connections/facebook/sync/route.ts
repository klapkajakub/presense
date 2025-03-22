import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { connectDB } from '@/lib/db';
import { PlatformConnection } from '@/models/PlatformConnection';
import { BusinessHours } from '@/models/BusinessHours';
import { syncFacebook } from '@/lib/platforms/sync';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

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

    await connectDB();

    // Get the platform connection
    const connection = await PlatformConnection.findOne({
      userId: payload.userId,
      platform: 'facebook',
      isActive: true
    });

    if (!connection) {
      return NextResponse.json(
        { error: 'Facebook connection not found' },
        { status: 404 }
      );
    }

    // Get current business data
    const [hours, business] = await Promise.all([
      BusinessHours.findOne(),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/business`).then(res => res.json())
    ]);

    if (!hours || !business) {
      return NextResponse.json(
        { error: 'Business data not found' },
        { status: 404 }
      );
    }

    // Sync with Facebook
    await syncFacebook(connection, {
      description: business.description,
      hours
    });

    // Update last synced timestamp
    await PlatformConnection.findByIdAndUpdate(connection._id, {
      lastSyncedAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error syncing with Facebook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 