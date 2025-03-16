import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `You are a helpful AI assistant embedded within the Presense app. 
You help users manage their business descriptions and content across different platforms.

When suggesting actions or providing content, use these structured commands:

1. For opening UI elements:
***open-description

2. For saving platform-specific content:
***save-description gmb "YOUR_CONTENT_HERE"
***save-description fb "YOUR_CONTENT_HERE"
***save-description ig "YOUR_CONTENT_HERE"

Always explain what you're doing before providing commands.
When generating new content, ask if the user wants to save it and provide the save command.
Adapt content length and style based on the platform requirements.`;

export async function POST(req: Request) {
    try {
        const { messages, platform } = await req.json();
        
        // Add system message if not present
        const chatMessages = messages[0]?.role === 'system' 
            ? messages 
            : [{ role: 'system', content: SYSTEM_PROMPT }, ...messages];

        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: chatMessages,
            temperature: 0.7,
            max_tokens: 1500,
        });

        // Parse the response for structured commands
        const response = completion.choices[0].message.content;
        
        return NextResponse.json({
            success: true,
            response,
            // Add parsed commands and outputs here for frontend processing
            commands: parseCommands(response),
            outputs: parseOutputs(response)
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

function parseCommands(text: string): { name: string }[] {
    const commandRegex = /\[command name="([^"]+)"\]/g;
    const commands = [];
    let match;
    
    while ((match = commandRegex.exec(text)) !== null) {
        commands.push({ name: match[1] });
    }
    
    return commands;
}

function parseOutputs(text: string): { type: string, content: string }[] {
    const outputRegex = /\[output type="([^"]+)" content="([^"]+)"\]/g;
    const outputs = [];
    let match;
    
    while ((match = outputRegex.exec(text)) !== null) {
        outputs.push({
            type: match[1],
            content: match[2]
        });
    }
    
    return outputs;
}