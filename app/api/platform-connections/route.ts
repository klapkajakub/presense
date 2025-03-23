import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PlatformConnection } from '@/models/PlatformConnection';

// Using mock auth for development
async function verifyAuth() {
  // Return mock user payload
  return {
    userId: 'mock-user-id'
  };
}

export async function GET(request: Request) {
  try {
    const payload = await verifyAuth();
    // Mock auth always returns a payload

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
    const payload = await verifyAuth();
    // Mock auth always returns a payload

    const { platform } = await request.json();
    if (!platform) {
      return NextResponse.json({ error: 'Platform is required' }, { status: 400 });
    }

    await connectDB();
    await PlatformConnection.findOneAndUpdate(
      { userId: payload.userId, platform },
      { isActive: false }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting platform connection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}