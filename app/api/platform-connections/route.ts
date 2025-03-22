import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { connectDB } from '@/lib/db';
import { PlatformConnection } from '@/models/PlatformConnection';

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

export async function GET(request: Request) {
  try {
    const payload = await verifyAuth(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const connections = await PlatformConnection.find({
      userId: payload.userId,
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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