import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { BusinessDescription } from '@/models/BusinessDescription';

export async function GET() {
        try {
                await connectDB();
                const doc = await BusinessDescription.findOne().lean();

                console.log('GET - Retrieved document:', doc);

                return NextResponse.json({
                        success: true,
                        data: doc?.descriptions || {
                                google: '',
                                facebook: '',
                                firmy: '',
                                instagram: ''
                        }
                });
        } catch (error) {
                console.error('GET Error:', error);
                return NextResponse.json({ error: 'Failed to fetch descriptions' }, { status: 500 });
        }
}

export async function POST(request: Request) {
        try {
                await connectDB();
                const { descriptions } = await request.json();

                console.log('POST - Saving descriptions:', descriptions);

                const updated = await BusinessDescription.findOneAndUpdate(
                        {},
                        { $set: { descriptions } },
                        { upsert: true, new: true, lean: true }
                );

                console.log('POST - Saved document:', updated);

                return NextResponse.json({
                        success: true,
                        data: updated.descriptions
                });
        } catch (error) {
                console.error('POST Error:', error);
                return NextResponse.json({ error: 'Failed to save descriptions' }, { status: 500 });
        }
}