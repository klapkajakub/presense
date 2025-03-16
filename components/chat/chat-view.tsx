"use client"

import { useState, useRef, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Copy, User2, Bot, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Message = {
    role: 'user' | 'assistant'
    content: string
}

const MarkdownComponents = {
    pre: ({ children }: { children: React.ReactNode }) => (
        <div className="relative my-2">
            <pre className="overflow-x-auto p-4 rounded bg-muted/50">
                {children}
            </pre>
        </div>
    ),
    code: ({ className, children }: { className?: string; children: React.ReactNode }) => (
        <code className={cn(
            "bg-muted/50 rounded px-1 py-0.5",
            !className ? "text-sm" : "text-xs"
        )}>
            {children}
        </code>
    ),
    ul: ({ children }: { children: React.ReactNode }) => (
        <ul className="list-disc list-inside my-2">{children}</ul>
    ),
    ol: ({ children }: { children: React.ReactNode }) => (
        <ol className="list-decimal list-inside my-2">{children}</ol>
    ),
    p: ({ children }: { children: React.ReactNode }) => (
        <p className="mb-2">{children}</p>
    )
}

function MessageContent({ content, role }: { content: string; role: Message['role'] }) {
    const [copied, setCopied] = useState(false)
    
    const handleCopy = async () => {
        await navigator.clipboard.writeText(content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="space-y-2">
            <div className="text-sm">
                {role === 'user' ? (
                    <div className="whitespace-pre-wrap">{content}</div>
                ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={MarkdownComponents}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
            {role === 'assistant' && (
                <div className="flex justify-start">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopy}
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
                    >
                        {copied ? (
                            <Check className="h-4 w-4 text-green-500" />
                        ) : (
                            <Copy className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                            {copied ? 'Copied!' : 'Copy message'}
                        </span>
                    </Button>
                </div>
            )}
        </div>
    )
}

function MessageBubble({ message, isLoading }: { message: Message, isLoading?: boolean }) {
    const [copied, setCopied] = useState(false)
    
    const handleCopy = async () => {
        await navigator.clipboard.writeText(message.content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className={cn(
            "group flex gap-3",
            message.role === 'user' ? "justify-end" : "justify-start"
        )}>
            {message.role === 'assistant' && (
                <Avatar className="h-8 w-8">
                    <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                </Avatar>
            )}
            <div className="flex flex-col">
                <div className={cn(
                    "rounded-lg px-4 py-2",
                    message.role === 'user'
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                )}>
                    <div className="text-sm">
                        {message.role === 'user' ? (
                            <div className="whitespace-pre-wrap">{message.content}</div>
                        ) : (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown 
                                    remarkPlugins={[remarkGfm]}
                                    components={MarkdownComponents}
                                >
                                    {message.content}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>
                </div>
                {message.role === 'assistant' && !isLoading && (
                    <div className="mt-1 flex items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCopy}
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            {copied ? (
                                <Check className="h-3 w-3 text-green-500" />
                            ) : (
                                <Copy className="h-3 w-3 text-muted-foreground" />
                            )}
                            <span className="sr-only">
                                {copied ? 'Copied!' : 'Copy message'}
                            </span>
                        </Button>
                    </div>
                )}
                {isLoading && message.role === 'assistant' && (
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Thinking...
                    </div>
                )}
            </div>
            {message.role === 'user' && (
                <Avatar className="h-8 w-8">
                    <AvatarFallback><User2 className="h-4 w-4" /></AvatarFallback>
                </Avatar>
            )}
        </div>
    )
}

export function ChatView() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hello! How can I help you today?" }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        try {
            setIsLoading(true)
            const userMessage = { role: 'user', content: input.trim() }
            setMessages(prev => [...prev, userMessage])
            setInput('')

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, userMessage] })
            })

            const data = await response.json()
            if (data.success) {
                setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: data.response 
                }])
            }
        } catch (error) {
            console.error('Chat error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-full">
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                    {messages.map((message, i) => (
                        <MessageBubble 
                            key={i} 
                            message={message}
                            isLoading={isLoading && i === messages.length - 1} 
                        />
                    ))}
                    <div ref={scrollRef} /> {/* Scroll anchor */}
                </div>
            </ScrollArea>
            <div className="border-t p-4">
                <form 
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleSend()
                    }}
                    className="flex gap-2"
                >
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="min-h-[80px]"
                        disabled={isLoading}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSend()
                            }
                        }}
                    />
                    <Button 
                        type="submit" 
                        size="icon"
                        disabled={isLoading || !input.trim()}
                    >
                        {isLoading ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </form>
            </div>
        </div>
    )
}