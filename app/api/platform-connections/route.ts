import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PlatformConnection, PlatformType } from '@/models/PlatformConnection';
import { BusinessDescription } from '@/models/BusinessDescription';
import { BusinessHours } from '@/models/BusinessHours';
import { syncPlatform } from '@/lib/platforms/enhanced-sync';
import { z } from 'zod';

// Request validation schemas
const platformSchema = z.enum(['google', 'facebook', 'instagram', 'firmy']);

// Using mock auth for development
async function verifyAuth() {
  // Return mock user payload
  return {
    userId: 'mock-user-id'
  };
}

export async function GET() {
  try {
    const payload = await verifyAuth();

    await connectDB();
    const connections = await PlatformConnection.find({
      userId: payload.userId,
      isActive: true
    }).select('platform lastSyncedAt');

    if (!connections || connections.length === 0) {
      return NextResponse.json({
        connections: []
      });
    }

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

export async function POST(request: NextRequest) {
  try {
    const payload = await verifyAuth();
    const body = await request.json();
    
    // Validate request body
    const result = platformSchema.safeParse(body.platform);
    if (!result.success) {
      return NextResponse.json({ 
        error: 'Invalid platform',
        message: 'Platform must be one of: google, facebook, instagram, firmy'
      }, { status: 400 });
    }
    
    const platform = result.data;
    
    await connectDB();
    
    // Fetch business data for syncing
    const [businessDesc, businessHours] = await Promise.all([
      BusinessDescription.findOne(),
      BusinessHours.findOne()
    ]);
    
    if (!businessDesc || !businessHours) {
      return NextResponse.json({ 
        error: 'Business data not found',
        message: 'Please set up your business description and hours before syncing'
      }, { status: 404 });
    }

    // Find the connection
    const connection = await PlatformConnection.findOne({
      userId: payload.userId,
      platform: platform,
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
      description: '',  // We don't have a description field, using empty string as fallback
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

export async function DELETE(request: NextRequest) {
  try {
    const payload = await verifyAuth();
    const body = await request.json();
    
    // Validate request body
    const result = platformSchema.safeParse(body.platform);
    if (!result.success) {
      return NextResponse.json({ 
        error: 'Invalid platform',
        message: 'Platform must be one of: google, facebook, instagram, firmy'
      }, { status: 400 });
    }
    
    const platform = result.data;
    
    await connectDB();
    
    const updateResult = await PlatformConnection.findOneAndUpdate(
      { userId: payload.userId, platform },
      { isActive: false }
    );
    
    if (!updateResult) {
      return NextResponse.json({ 
        error: 'Platform connection not found',
        message: `No active connection found for ${platform}`
      }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting platform connection:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}