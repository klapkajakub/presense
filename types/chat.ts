import { ActionCall } from './action';

export type Message = {
    role: 'system' | 'user' | 'assistant';
    content: string;
    image?: string; // Base64 encoded image or URL to image
    messageId?: string; // Unique identifier for the message
    actions?: ActionCall[]; // Actions associated with this message
}

export type ChatResponse = {
    success: boolean;
    response?: string;
    error?: string;
    actions?: ActionCall[];
    commands?: { name: string }[];
    outputs?: { type: string, content: string }[];
    imageUrls?: Record<string, string>;
}