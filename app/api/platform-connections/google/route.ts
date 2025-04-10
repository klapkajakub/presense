import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { PlatformConnection } from '@/models/PlatformConnection';
import { 
  getGoogleBusinessAccounts, 
  getGoogleBusinessLocations, 
  updateGoogleBusinessInfo,
  updateGoogleBusinessHours
} from '@/lib/platforms/google-business';

// Request validation schemas
const updateBusinessInfoSchema = z.object({
  locationId: z.string(),
  description: z.string().optional(),
  name: z.string().optional(),
  primaryPhone: z.string().optional(),
  websiteUrl: z.string().optional()
});

// Using mock auth for development
async function verifyAuth() {
  // Return mock user payload
  return {
    userId: 'mock-user-id'
  };
}

// Get Google Business accounts and locations
export async function GET(request: NextRequest) {
  try {
    const payload = await verifyAuth();
    
    await connectDB();
    
    // Find the active Google connection
    const connection = await PlatformConnection.findOne({
      userId: payload.userId,
      platform: 'google',
      isActive: true
    });
    
    if (!connection) {
      return NextResponse.json({
        success: false,
        error: 'No active Google connection found'
      }, { status: 404 });
    }
    
    // Get accounts first
    const accountsResponse = await getGoogleBusinessAccounts(
      connection.accessToken as string,
      connection.refreshToken as string
    );
    
    if (!accountsResponse.success || !accountsResponse.data) {
      return NextResponse.json({
        success: false,
        error: accountsResponse.error || 'Failed to fetch Google accounts',
        message: accountsResponse.message
      }, { status: 500 });
    }
    
    // For each account, get locations
    const accountsWithLocations = await Promise.all(
      accountsResponse.data.map(async (account) => {
        const locationsResponse = await getGoogleBusinessLocations(
          connection.accessToken as string,
          connection.refreshToken as string,
          account.name
        );
        
        return {
          accountName: account.name,
          accountDisplayName: account.accountName,
          locations: locationsResponse.data || []
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      data: accountsWithLocations
    });
    
  } catch (error) {
    console.error('Error fetching Google Business data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch Google Business data',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// Update Google Business information
export async function POST(request: NextRequest) {
  try {
    const payload = await verifyAuth();
    const body = await request.json();
    
    // Validate request data
    const validationResult = updateBusinessInfoSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        validationErrors: validationResult.error.errors
      }, { status: 400 });
    }
    
    const { locationId, ...businessInfo } = validationResult.data;
    
    await connectDB();
    
    // Find the active Google connection
    const connection = await PlatformConnection.findOne({
      userId: payload.userId,
      platform: 'google',
      isActive: true
    });
    
    if (!connection) {
      return NextResponse.json({
        success: false,
        error: 'No active Google connection found'
      }, { status: 404 });
    }
    
    // Update Google Business Info
    const updateResponse = await updateGoogleBusinessInfo(
      connection.accessToken as string,
      connection.refreshToken as string,
      locationId,
      businessInfo
    );
    
    if (!updateResponse.success) {
      return NextResponse.json({
        success: false,
        error: updateResponse.error || 'Failed to update Google Business information',
        message: updateResponse.message
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Google Business information updated successfully',
      data: updateResponse.data
    });
    
  } catch (error) {
    console.error('Error updating Google Business information:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update Google Business information',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 