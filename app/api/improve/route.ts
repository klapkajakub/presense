import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
        try {
                const { platform, text, maxLength, context } = await req.json();

                const systemMessages = {
                        google: `You are an expert in writing Google Business Profile descriptions. 
                    Keep the text under ${maxLength} characters. 
                    Focus on local SEO, include relevant keywords, and highlight unique selling points. 
                    Make it engaging but professional.`,
                        facebook: `You are an expert in writing Facebook Business Page descriptions. 
                      Keep the text under ${maxLength} characters. 
                      Make it conversational and engaging, include call-to-actions, 
                      and highlight what makes the business unique.`,
                        firmy: `You are an expert in writing Firmy.cz business listings. 
                    Keep the text under ${maxLength} characters. 
                    Focus on Czech market specifics, include relevant keywords, 
                    and make it clear and professional.`,
                        instagram: `You are an expert in writing Instagram business bios. 
                       Keep the text under ${maxLength} characters. 
                       Make it engaging, use appropriate emojis, 
                       include call-to-actions, and highlight brand personality.`
                };

                const completion = await openai.chat.completions.create({
                        model: "gpt-4-turbo-preview",
                        messages: [
                                {
                                        role: "system",
                                        content: systemMessages[platform as keyof typeof systemMessages]
                                },
                                {
                                        role: "user",
                                        content: `Improve this business description: "${text}". 
                             Context: ${context}. 
                             Keep it under ${maxLength} characters.`
                                }
                        ],
                        temperature: 0.7,
                        max_tokens: 1000,
                });

                if (!completion.choices[0].message.content) {
                        throw new Error('No improved text generated');
                }

                return NextResponse.json({
                        success: true,
                        improvedText: completion.choices[0].message.content.trim()
                });

        } catch (error) {
                console.error('Improve API error:', error);
                return NextResponse.json(
                        { error: 'Failed to improve text' },
                        { status: 500 }
                );
        }
}