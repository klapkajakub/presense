import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { BusinessDescription } from '@/models/BusinessDescription';
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
      return NextResponse.json({
        success: false,
        message: 'Not authenticated'
      }, { status: 401 });
    }
    
    await connectDB();
    
    // Fetch business description from database
    const businessDescription = await BusinessDescription.findOne({ 
      userId: new mongoose.Types.ObjectId(userId) 
    }).lean();
    
    if (!businessDescription) {
      // Create a default description if none exists
      const defaultDescriptions = {
        google: '',
        facebook: '',
        instagram: '',
        firmy: ''
      };
      
      return NextResponse.json({
        success: true,
        data: {
          description: '',
          descriptions: defaultDescriptions
        }
      });
    }
    
    console.log('Retrieved business descriptions:', businessDescription);
    
    return NextResponse.json({
      success: true,
      data: {
        description: '',  // Main description - not stored in this model
        descriptions: businessDescription.descriptions
      }
    });
  } catch (error) {
    console.error('Error fetching business description:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch business description'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user ID from cookie
    const userId = getUserIdFromCookie(request);
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'Not authenticated'
      }, { status: 401 });
    }
    
    const body = await request.json();
    const { description, descriptions } = body;
    
    if (!description && !descriptions) {
      return NextResponse.json({
        success: false,
        error: 'No data provided'
      }, { status: 400 });
    }
    
    await connectDB();
    
    console.log('Updating business descriptions with:', descriptions);
    
    // Check if a record exists first
    let businessDescription = await BusinessDescription.findOne({ 
      userId: new mongoose.Types.ObjectId(userId) 
    });
    
    if (businessDescription) {
      // Update existing record
      businessDescription.descriptions = descriptions || {};
      await businessDescription.save();
    } else {
      // Create new record
      businessDescription = new BusinessDescription({
        userId: new mongoose.Types.ObjectId(userId),
        descriptions: descriptions || {}
      });
      await businessDescription.save();
    }
    
    console.log('Updated business descriptions:', businessDescription);
    
    return NextResponse.json({
      success: true,
      data: {
        description: description || '',
        descriptions: businessDescription.descriptions
      }
    });
  } catch (error) {
    console.error('Error updating business description:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update business description'
    }, { status: 500 });
  }
}