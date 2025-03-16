"use client"

import { useState, useRef, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Copy, User2, Bot, Check, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useModal } from "@/components/modals/modal-context" // Add this import
import { IconContainer } from "@/components/ui/icon-container" // Add this if not already imported
import { useDescriptions } from "@/components/descriptions/descriptions-context"
import { ChatAction } from "./chat-action"
import { Message } from "@/types/chat"

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

function MessageCommand({ commands, outputs }: { 
  commands: { name: string }[], 
  outputs: { type: string, content: string }[] 
}) {
  const { openModal } = useModal()
  const { updateDescription } = useDescriptions()
  const [executed, setExecuted] = useState<string[]>([])

  useEffect(() => {
    outputs.forEach(output => {
      if (executed.includes(`${output.type}-${output.content.substring(0, 20)}`)) return
      
      switch (output.type) {
        case 'gmb':
          updateDescription('gmb', output.content)
          openModal('update-description')
          break
        case 'fb':
          updateDescription('fb', output.content)
          openModal('update-description')
          break
        case 'ig':
          updateDescription('ig', output.content)
          openModal('update-description')
          break
      }
      
      setExecuted(prev => [...prev, `${output.type}-${output.content.substring(0, 20)}`])
    })

    commands.forEach(cmd => {
      if (executed.includes(cmd.name)) return
      
      switch (cmd.name) {
        case 'open-description':
          openModal('update-description')
          setExecuted(prev => [...prev, cmd.name])
          break
      }
    })
  }, [commands, outputs, executed, openModal, updateDescription])

  return (
    <div className="mt-2 space-y-2">
      {commands.map((cmd, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="flex-1">
            <div className="rounded-lg px-4 py-2 bg-background border flex items-center gap-2">
              <IconContainer 
                icon="fa-solid fa-terminal" 
                size="sm"
                containerClassName="bg-primary/5" 
              />
              <span className="text-sm text-muted-foreground">
                {executed.includes(cmd.name) ? 'Executed command: ' : 'Executing command: '}
                {cmd.name}
              </span>
            </div>
          </div>
        </div>
      ))}
      
      {outputs.map((output, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="flex-1">
            <div className="rounded-lg px-4 py-2 bg-background border flex items-center gap-2">
              <IconContainer 
                icon={`fa-brands fa-${output.type}`}
                size="sm"
                containerClassName="bg-primary/5" 
              />
              <span className="text-sm text-muted-foreground">
                {executed.includes(`${output.type}-${output.content.substring(0, 20)}`) 
                  ? 'Content updated for: ' 
                  : 'Updating content for: '}
                {output.type.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function parseMessage(content: string) {
  const commandRegex = /\[command name="([^"]+)"\]/g;
  const outputRegex = /\[output type="([^"]+)" content="([^"]+)"\]/g;
  
  // Extract the main message (everything before first command/output)
  let messageContent = content;
  const firstCommand = content.indexOf('[command');
  const firstOutput = content.indexOf('[output');
  const firstIndex = Math.min(
    firstCommand > -1 ? firstCommand : Infinity,
    firstOutput > -1 ? firstOutput : Infinity
  );
  
  if (firstIndex !== Infinity) {
    messageContent = content.substring(0, firstIndex).trim();
  }

  // Parse commands
  const commands: { name: string }[] = [];
  let cmdMatch;
  while ((cmdMatch = commandRegex.exec(content)) !== null) {
    commands.push({ name: cmdMatch[1] });
  }

  // Parse outputs
  const outputs: { type: string, content: string }[] = [];
  let outMatch;
  while ((outMatch = outputRegex.exec(content)) !== null) {
    outputs.push({
      type: outMatch[1],
      content: outMatch[2]
    });
  }

  return { messageContent, commands, outputs };
}

function MessageContent({ content, role }: { content: string; role: Message['role'] }) {
  const { messageContent, commands, outputs } = parseMessage(content);

  return (
    <div className="space-y-2">
      {role === 'user' ? (
        <div className="whitespace-pre-wrap">{messageContent}</div>
      ) : (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]} 
            components={MarkdownComponents}
          >
            {messageContent}
          </ReactMarkdown>
        </div>
      )}
      {(commands.length > 0 || outputs.length > 0) && (
        <MessageCommand commands={commands} outputs={outputs} />
      )}
    </div>
  );
}

function MessageBubble({ message, isLoading }: { message: Message, isLoading?: boolean }) {
  const [copied, setCopied] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    } else {
      const utterance = new SpeechSynthesisUtterance(message.content)
      utterance.onend = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
      setIsSpeaking(true)
    }
  }

  return (
    <div className="space-y-2">
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
            <MessageContent content={message.content} role={message.role} />
          </div>
          {/* Action buttons for copy/speak */}
          {message.role === 'assistant' && !isLoading && (
            <div className="mt-1 flex items-center gap-1">
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
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSpeak}
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {isSpeaking ? (
                  <VolumeX className="h-3 w-3 text-primary" />
                ) : (
                  <Volume2 className="h-3 w-3 text-muted-foreground" />
                )}
              </Button>
            </div>
          )}
        </div>
        {message.role === 'user' && (
          <Avatar className="h-8 w-8">
            <AvatarFallback><User2 className="h-4 w-4" /></AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  )
}

// Add this after the MessageBubble component

function LoadingMessage() {
    return (
        <div className="flex gap-3">
            <Avatar className="h-8 w-8">
                <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
                <div className="rounded-lg px-4 py-2 bg-muted">
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        <span className="text-sm text-muted-foreground">AI is thinking...</span>
                    </div>
                </div>
            </div>
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

    const parseMessageCommands = (content: string) => {
        const parts = content.split('***')
        const message = parts[0]
        const commands = parts.slice(1).map(cmd => {
          const match = cmd.match(/^(save-description|open-description)(?:\s+(\w+)\s+"([^"]+)")?/)
          if (match) {
            return {
              command: match[1],
              platform: match[2],
              content: match[3]
            }
          }
          return null
        }).filter(Boolean)
    
        return { message, commands }
      }

    return (
        <div className="flex flex-col h-full">
            
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                    {messages.map((message, i) => {
                        const { message: text, commands } = parseMessageCommands(message.content)
                        
                        return (
                          <div key={i} className="space-y-2">
                            <div className="prose prose-sm dark:prose-invert">
                              {text}
                            </div>
                            {commands?.map((cmd, j) => (
                              <ChatAction 
                                key={j}
                                command={cmd.command}
                                platform={cmd.platform}
                                content={cmd.content}
                              />
                            ))}
                          </div>
                        )
                      })}
                    {isLoading && <LoadingMessage />}
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