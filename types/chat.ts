export type Message = {
    role: 'system' | 'user' | 'assistant';
    content: string;
    image?: string; // Base64 encoded image or URL to image
}

export type ChatResponse = {
    success: boolean;
    response?: string;
    error?: string;
}