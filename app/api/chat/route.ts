import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `You are a helpful AI assistant. Be concise and clear in your responses.
Provide accurate and relevant information. If you're not sure about something, say so.`;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        
        // Add system message if not present
        const chatMessages = messages[0]?.role === 'system' 
            ? messages 
            : [{ role: 'system', content: SYSTEM_PROMPT }, ...messages];

        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: chatMessages,
            temperature: 0.7,
            max_tokens: 1000,
        });

        return NextResponse.json({
            success: true,
            response: completion.choices[0].message.content
        });

    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { 
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            },
            { status: 500 }
        );
    }
}