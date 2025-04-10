import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { availableActions } from '@/lib/chat/actions';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `You are a powerful agentic AI assistant embedded within the Presense app. You help users manage their business descriptions and content across different platforms.

# Available Tools
You can use tools to help users accomplish tasks. When appropriate, use the available tools rather than just describing what the user could do.
`;

// Convert our action definitions to OpenAI function definitions
const availableFunctions = availableActions.map(action => ({
    type: 'function',
    function: {
        name: action.id,
        description: action.description,
        parameters: {
            type: 'object',
            properties: action.parameters.reduce((acc, param) => {
                acc[param.name] = {
                    type: param.type,
                    description: param.description
                };
                return acc;
            }, {}),
            required: action.parameters.filter(param => param.required).map(param => param.name)
        }
    }
}));

export async function POST(req: Request) {
    try {
        const { messages, platform } = await req.json();
        
        // Add system message if not present
        const chatMessages = messages[0]?.role === 'system' 
            ? messages 
            : [{ role: 'system', content: SYSTEM_PROMPT }, ...messages];
            
        // Extract image URLs from messages for later use
        const imageUrls = {};
        chatMessages.forEach((msg, index) => {
            if (msg.image) {
                imageUrls[index] = msg.image;
            }
        });
            
        // Filter out image property from messages for OpenAI API
        // OpenAI API doesn't accept additional properties in messages
        const apiMessages = chatMessages.map(({ role, content }) => ({ role, content }));

        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: apiMessages,
            temperature: 0.7,
            max_tokens: 1500,
            tools: availableFunctions,
            tool_choice: 'auto'
        });

        const response = completion.choices[0].message;
        
        // Extract tool calls from the response
        const toolCalls = response.tool_calls || [];
        
        // Transform tool calls to our action format
        const actions = toolCalls.map(tool => {
            try {
                const functionCall = tool.function;
                const parameters = JSON.parse(functionCall.arguments);
                
                return {
                    action: functionCall.name,
                    parameters: parameters || {}
                };
            } catch (error) {
                console.error('Error parsing tool call arguments:', error);
                return null;
            }
        }).filter(Boolean);
        
        return NextResponse.json({
            success: true,
            response: response.content || '',
            actions: actions.map(action => ({
                actionId: action.action,
                parameters: action.parameters || {},
                status: 'pending',
                messageId: uuidv4()
            })),
            imageUrls
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