"use client"

import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Bot, Check, Copy, User2, Volume2, VolumeX } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system' | 'action'
  content: string
  isCommand?: boolean
}

const MarkdownComponents = {
  pre: ({ children }: { children: React.ReactNode }) => (
    <div className="relative my-2">
      <pre className="overflow-x-auto p-4 rounded bg-muted/50">{children}</pre>
    </div>
  ),
  code: ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <code className={cn("bg-muted/50 rounded px-1 py-0.5", !className ? "text-sm" : "text-xs")}>
      {children}
    </code>
  ),
}

export function ChatMessage({ role, content, isCommand }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
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
      const utterance = new SpeechSynthesisUtterance(content)
      utterance.onend = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
      setIsSpeaking(true)
    }
  }

  return (
    <div className="space-y-2">
      <div className={cn(
        "group flex gap-3",
        role === 'user' ? "justify-end" : "justify-start"
      )}>
        {role === 'assistant' && (
          <Avatar className="h-8 w-8">
            <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
          </Avatar>
        )}
        <div className="flex flex-col">
          <div className={cn(
            "rounded-lg px-4 py-2",
            role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
          )}>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                {content}
              </ReactMarkdown>
            </div>
          </div>
          {role === 'assistant' && (
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
        {role === 'user' && (
          <Avatar className="h-8 w-8">
            <AvatarFallback><User2 className="h-4 w-4" /></AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  )
}