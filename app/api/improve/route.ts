import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { openai } from '@/lib/openai';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const { currentText, maxLength, platform } = body;

        if (!currentText) {
            return new NextResponse('No text provided', { status: 400 });
        }

        const prompt = platform
            ? `Improve the following business description for ${platform}. Make it more engaging and professional while staying within ${maxLength} characters. Focus on platform-specific best practices and tone:\n\n${currentText}`
            : `Improve the following business description. Make it more engaging and professional while staying within ${maxLength} characters:\n\n${currentText}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                {
                    role: "system",
                    content: "You are a professional business copywriter. Your task is to improve business descriptions while maintaining their core message and staying within character limits."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 1000
        });

        const improvedText = completion.choices[0].message.content;

        if (!improvedText) {
            return new NextResponse('Failed to generate improved text', { status: 500 });
        }

        return NextResponse.json({ improvedText });
    } catch (error) {
        console.error('Error improving text:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}