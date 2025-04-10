import { NextRequest, NextResponse } from 'next/server';
// Import the BusinessHours type for type checking
import { IBusinessHours } from '@/models/BusinessHours';
import { connectDB } from '@/lib/database';
import { BusinessHours } from '@/models/BusinessHours';
import { z } from 'zod';
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

// Define validation schema for time range
const timeRangeSchema = z.object({
  open: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:MM format"),
  close: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:MM format")
});

// Define validation schema for day schedule
const dayScheduleSchema = z.object({
  isOpen: z.boolean(),
  ranges: z.array(timeRangeSchema).optional().default([])
});

// Define validation schema for business hours
const businessHoursSchema = z.object({
  regularHours: z.object({
    monday: dayScheduleSchema,
    tuesday: dayScheduleSchema,
    wednesday: dayScheduleSchema,
    thursday: dayScheduleSchema,
    friday: dayScheduleSchema,
    saturday: dayScheduleSchema,
    sunday: dayScheduleSchema
  }),
  specialDays: z.array(
    z.object({
      date: z.string().or(z.date()),
      isOpen: z.boolean(),
      ranges: z.array(timeRangeSchema).optional().default([]),
      note: z.string().optional()
    })
  ).optional().default([])
});

// Default business hours
const defaultBusinessHours = {
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

export async function GET(request: NextRequest) {
  try {
    // Get user ID from cookie
    const userId = getUserIdFromCookie(request);
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Not authenticated'
        },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    // Find existing business hours or create default
    let hours = await BusinessHours.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    
    if (!hours) {
      // Create default business hours with user ID
      const newHours = new BusinessHours({
        ...defaultBusinessHours,
        userId: new mongoose.Types.ObjectId(userId)
      });
      await newHours.save();
      hours = newHours;
      console.log('Created default business hours:', hours);
    } else {
      console.log('Retrieved business hours:', hours);
    }

    return NextResponse.json({
      success: true,
      data: hours
    });
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch business hours',
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user ID from cookie
    const userId = getUserIdFromCookie(request);
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Not authenticated'
        },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validate input with Zod schema
    const validationResult = businessHoursSchema.safeParse(body.hours);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid business hours data',
          validationErrors: validationResult.error.errors 
        },
        { status: 400 }
      );
    }
    
    const validatedHours = validationResult.data;
    
    // Convert string dates to Date objects in specialDays
    const specialDays = validatedHours.specialDays.map(day => ({
      ...day,
      date: typeof day.date === 'string' ? new Date(day.date) : day.date
    }));
    
    await connectDB();
    
    // Check if a record exists first
    let businessHours = await BusinessHours.findOne({ 
      userId: new mongoose.Types.ObjectId(userId) 
    });
    
    if (businessHours) {
      // Update existing record
      businessHours.regularHours = validatedHours.regularHours;
      businessHours.specialDays = specialDays;
      await businessHours.save();
    } else {
      // Create new record
      businessHours = new BusinessHours({
        userId: new mongoose.Types.ObjectId(userId),
        regularHours: validatedHours.regularHours,
        specialDays: specialDays
      });
      await businessHours.save();
    }

    console.log('Updated business hours:', businessHours);

    return NextResponse.json({
      success: true,
      data: businessHours
    });
    
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save business hours',
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}