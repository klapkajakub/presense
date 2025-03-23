import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PlatformConnection, PlatformType } from '@/models/PlatformConnection';
import { BusinessDescription } from '@/models/BusinessDescription';
import { BusinessHours } from '@/models/BusinessHours';
import { syncPlatform } from '@/lib/platforms/enhanced-sync';

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
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await verifyAuth();
    const { platform } = await request.json();
    
    if (!platform) {
      return NextResponse.json({ error: 'Platform is required' }, { status: 400 });
    }

    await connectDB();
    
    // Fetch business data for syncing
    const businessDesc = await BusinessDescription.findOne();
    const businessHours = await BusinessHours.findOne();
    
    if (!businessDesc || !businessHours) {
      return NextResponse.json({ 
        error: 'Business data not found',
        message: 'Please set up your business description and hours before syncing'
      }, { status: 404 });
    }

    // Find the connection
    const connection = await PlatformConnection.findOne({
      userId: payload.userId,
      platform: platform as PlatformType,
      isActive: true
    });

    if (!connection) {
      return NextResponse.json({ 
        error: 'Platform connection not found',
        message: `No active connection found for ${platform}`
      }, { status: 404 });
    }

    // Sync data to the platform
    const syncResult = await syncPlatform(connection, {
      description: businessDesc.description || '',
      platformDescriptions: businessDesc.descriptions || {},
      hours: businessHours
    });

    if (syncResult.success) {
      // Update lastSyncedAt
      await PlatformConnection.findByIdAndUpdate(
        connection._id,
        { lastSyncedAt: new Date() }
      );

      return NextResponse.json({
        success: true,
        message: syncResult.message
      });
    } else {
      return NextResponse.json({
        error: 'Sync failed',
        message: syncResult.message,
        details: syncResult.error
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error syncing platform:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}