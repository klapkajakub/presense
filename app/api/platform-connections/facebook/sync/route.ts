import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { PlatformConnection } from '@/models/PlatformConnection';
import { BusinessHours } from '@/models/BusinessHours';
import { syncFacebook } from '@/lib/platforms/sync';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectDB();

    // Get the platform connection
    const connection = await PlatformConnection.findOne({
      userId: session.user.id,
      platform: 'facebook',
      isActive: true
    });

    if (!connection) {
      return new NextResponse('Facebook connection not found', { status: 404 });
    }

    // Get current business data
    const [hours, business] = await Promise.all([
      BusinessHours.findOne(),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/business`).then(res => res.json())
    ]);

    if (!hours || !business) {
      return new NextResponse('Business data not found', { status: 404 });
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
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 