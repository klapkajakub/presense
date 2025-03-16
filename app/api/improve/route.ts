import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { PLATFORM_CONFIGS } from '@/types/business';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
    try {
        const { platform, currentText, maxLength } = await req.json();

        if (!currentText) {
            return NextResponse.json({ 
                success: false, 
                message: 'No text provided' 
            });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                {
                    role: 'system',
                    content: `You are an AI helping to improve business descriptions. 
                    Keep the improved text under ${maxLength} characters.
                    Maintain the core message but make it more engaging and professional.`
                },
                {
                    role: 'user',
                    content: `Improve this ${platform} business description: ${currentText}`
                }
            ],
            temperature: 0.7,
            max_tokens: 500,
        });

        const improvedText = completion.choices[0].message.content?.trim();

        if (!improvedText) {
            throw new Error('No improved text generated');
        }

        return NextResponse.json({
            success: true,
            improvedText
        });

    } catch (error) {
        console.error('Improve API error:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : 'Failed to improve text'
            },
            { status: 500 }
        );
    }
}