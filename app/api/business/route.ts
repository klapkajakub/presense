import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { Business } from '@/models/Business';
import mongoose from 'mongoose';

// Auth cookie name
const AUTH_COOKIE = 'presense_auth';

// Helper to get user ID from cookie
function getUserIdFromCookie(request: NextRequest): string | null {
  try {
    const authCookie = request.cookies.get(AUTH_COOKIE);
    
    if (!authCookie) {
      return null;
    }
    
    const sessionData = JSON.parse(
      Buffer.from(authCookie.value, 'base64').toString()
    );
    
    // Check if token is expired
    if (sessionData.exp < Date.now()) {
      return null;
    }
    
    return sessionData.userId;
  } catch (error) {
    console.error('Error getting user ID from cookie:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user ID from cookie
    const userId = getUserIdFromCookie(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    await connectDB();
    const business = await Business.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    
    if (!business) {
      // Return an empty business object
      return NextResponse.json({
        _id: null,
        name: '',
        description: '',
        platformVariants: {},
        userId
      });
    }

    return NextResponse.json(business);
  } catch (error) {
    console.error('Error fetching business:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user ID from cookie
    const userId = getUserIdFromCookie(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const body = await request.json();
    const { description, platformVariants, name, address, contact, categories } = body;
    
    if (!description && 
        !name && 
        !address && 
        !contact && 
        !categories && 
        (!platformVariants || Object.keys(platformVariants).length === 0)) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    await connectDB();

    // Create update object
    const updateData: any = {
      userId: new mongoose.Types.ObjectId(userId)
    };
    
    if (description !== undefined) {
      updateData.description = description;
    }
    
    if (name !== undefined) {
      updateData.name = name;
    }
    
    if (address !== undefined) {
      updateData.address = address;
    }
    
    if (contact !== undefined) {
      updateData.contact = contact;
    }
    
    if (categories !== undefined) {
      updateData.categories = categories;
    }
    
    if (platformVariants && Object.keys(platformVariants).length > 0) {
      updateData.platformVariants = platformVariants;
    }

    console.log('Updating business with data:', updateData);
    
    const business = await Business.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      { $set: updateData },
      { upsert: true, new: true, lean: true }
    );

    if (!business) {
      return NextResponse.json({ error: 'Failed to update business' }, { status: 500 });
    }

    console.log('Updated business:', business);
    return NextResponse.json(business);
  } catch (error) {
    console.error('Error updating business:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}