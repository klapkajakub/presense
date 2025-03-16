import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { BusinessDescription } from '@/models/BusinessDescription';

export async function POST(request: Request) {
        try {
                await connectDB();
                const { description } = await request.json();

                const businessDesc = await BusinessDescription.findOneAndUpdate(
                        {}, // empty filter to match any document
                        { description },
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