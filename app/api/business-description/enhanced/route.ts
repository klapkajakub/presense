import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { BusinessDescription } from '@/models/BusinessDescription';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { description, platformDescriptions } = await request.json();

    // Validate input
    if (!description && !platformDescriptions) {
      return NextResponse.json(
        { error: 'At least one of description or platformDescriptions must be provided' },
        { status: 400 }
      );
    }

    // Prepare update object
    const updateData: any = {};
    
    if (description) {
      updateData.description = description;
    }

    if (platformDescriptions && Object.keys(platformDescriptions).length > 0) {
      // For each platform, update its description
      Object.entries(platformDescriptions).forEach(([platform, text]) => {
        updateData[`descriptions.${platform}`] = text;
      });
    }

    const businessDesc = await BusinessDescription.findOneAndUpdate(
      {}, // empty filter to match any document
      { $set: updateData },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, data: businessDesc });
  } catch (error) {
    console.error('Error saving business description:', error);
    return NextResponse.json(
      { error: 'Failed to save business description' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const businessDesc = await BusinessDescription.findOne();
    return NextResponse.json({ success: true, data: businessDesc });
  } catch (error) {
    console.error('Error fetching business description:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business description' },
      { status: 500 }
    );
  }
}