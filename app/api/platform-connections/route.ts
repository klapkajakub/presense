import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { PlatformConnection } from '@/models/PlatformConnection';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectDB();
    const connections = await PlatformConnection.find({
      userId: session.user.id,
      isActive: true
    }).select('platform lastSyncedAt');

    return NextResponse.json({
      connections: connections.map(conn => ({
        platform: conn.platform,
        isConnected: true,
        lastSyncedAt: conn.lastSyncedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching platform connections:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { platform } = await request.json();
    if (!platform) {
      return new NextResponse('Platform is required', { status: 400 });
    }

    await connectDB();
    await PlatformConnection.findOneAndUpdate(
      { userId: session.user.id, platform },
      { isActive: false }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting platform connection:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 