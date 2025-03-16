export type Message = {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export type ChatResponse = {
    success: boolean;
    response?: string;
    error?: string;
}