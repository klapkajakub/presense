import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { BusinessHours } from '@/models/BusinessHours';

export async function GET() {
  try {
    await connectDB();
    const hours = await BusinessHours.findOne().lean();

    if (!hours) {
      // Return default business hours if none exist
      const defaultHours = {
        regularHours: {
          monday: { isOpen: true, ranges: [{ open: "09:00", close: "17:00" }] },
          tuesday: { isOpen: true, ranges: [{ open: "09:00", close: "17:00" }] },
          wednesday: { isOpen: true, ranges: [{ open: "09:00", close: "17:00" }] },
          thursday: { isOpen: true, ranges: [{ open: "09:00", close: "17:00" }] },
          friday: { isOpen: true, ranges: [{ open: "09:00", close: "17:00" }] },
          saturday: { isOpen: false, ranges: [] },
          sunday: { isOpen: false, ranges: [] }
        },
        specialDays: []
      };

      // Create default hours in database
      await BusinessHours.create(defaultHours);

      return NextResponse.json({
        success: true,
        data: defaultHours
      });
    }

    return NextResponse.json({
      success: true,
      data: hours
    });
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business hours' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { hours } = await request.json();

    // Validate the hours data
    if (!hours?.regularHours) {
      throw new Error('Invalid hours data');
    }

    const updated = await BusinessHours.findOneAndUpdate(
      {},
      hours,
      { upsert: true, new: true, lean: true }
    );

    return NextResponse.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to save business hours' },
      { status: 500 }
    );
  }
} 