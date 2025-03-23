import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { Business } from '@/models/Business';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '../../../lib/session';

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const session = await getIronSession(cookieStore, sessionOptions);
    
    if (!session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const business = await Business.findOne();
    
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
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

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const session = await getIronSession(cookieStore, sessionOptions);
    
    if (!session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { description, platformVariants } = body;
    
    if (!description && (!platformVariants || Object.keys(platformVariants).length === 0)) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    await connectDB();

    // Create update object
    const updateData: any = {};
    
    if (description !== undefined) {
      updateData.description = description;
    }
    
    if (platformVariants && Object.keys(platformVariants).length > 0) {
      updateData.platformVariants = platformVariants;
    }

    const business = await Business.findOneAndUpdate(
      {},
      { $set: updateData },
      { upsert: true, new: true }
    );

    if (!business) {
      return NextResponse.json({ error: 'Failed to update business' }, { status: 500 });
    }

    return NextResponse.json(business);
  } catch (error) {
    console.error('Error updating business:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}