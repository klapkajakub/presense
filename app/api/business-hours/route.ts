import { NextResponse } from 'next/server';
// Import the BusinessHours type for type checking
import { IBusinessHours } from '@/models/BusinessHours';

export async function GET() {
  try {
    // Return mock business hours data
    const mockHours = {
      _id: "mock-business-hours-id",
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
    } as IBusinessHours;

    return NextResponse.json({
      success: true,
      data: mockHours
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
    const { hours } = await request.json();

    // Validate the hours data
    if (!hours?.regularHours) {
      throw new Error('Invalid hours data');
    }

    // Instead of saving to database, just return the submitted hours with an ID
    const mockUpdated = {
      _id: "mock-business-hours-id",
      ...hours
    };

    return NextResponse.json({
      success: true,
      data: mockUpdated
    });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to save business hours' },
      { status: 500 }
    );
  }
}