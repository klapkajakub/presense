import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PlatformConnection } from '@/models/PlatformConnection';
import { BusinessHours } from '@/models/BusinessHours';
import { syncGoogleBusiness, syncFacebook } from '@/lib/platforms/sync';

// Verify the request is from a cron job
function verifyCronRequest(request: Request) {
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

export async function POST(request: Request) {
  try {
    // Verify this is a cron request
    if (!verifyCronRequest(request)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectDB();

    // Get all active platform connections
    const connections = await PlatformConnection.find({
      isActive: true
    });

    // Get current business data
    const [hours, business] = await Promise.all([
      BusinessHours.findOne(),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/business`).then(res => res.json())
    ]);

    if (!hours || !business) {
      return new NextResponse('Business data not found', { status: 404 });
    }

    // Sync each platform
    const syncPromises = connections.map(async (connection) => {
      try {
        switch (connection.platform) {
          case 'google':
            await syncGoogleBusiness(connection, {
              description: business.description,
              hours
            });
            break;
          case 'facebook':
            await syncFacebook(connection, {
              description: business.description,
              hours
            });
            break;
        }

        // Update last synced timestamp
        await PlatformConnection.findByIdAndUpdate(connection._id, {
          lastSyncedAt: new Date()
        });
      } catch (error) {
        console.error(`Error syncing ${connection.platform}:`, error);
        // Continue with other platforms even if one fails
      }
    });

    await Promise.all(syncPromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in sync cron job:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 