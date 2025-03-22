import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { connectDB } from '@/lib/db';
import { OpenAI } from 'openai';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function verifyAuth(request: Request) {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
        return null;
    }

    try {
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch {
        return null;
    }
}

export async function POST(request: Request) {
    try {
        const payload = await verifyAuth(request);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { text, platform } = await request.json();

        if (!text || !platform) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: `You are a helpful assistant that improves business descriptions for ${platform}. 
                             Make the text more engaging and professional while maintaining the core message.
                             Keep the tone consistent with the platform's style.`
                },
                {
                    role: 'user',
                    content: text
                }
            ]
        });

        const improvedText = completion.choices[0]?.message?.content;

        if (!improvedText) {
            return NextResponse.json(
                { error: 'Failed to generate improved text' },
                { status: 500 }
            );
        }

        return NextResponse.json({ text: improvedText });
    } catch (error) {
        console.error('Error improving text:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}