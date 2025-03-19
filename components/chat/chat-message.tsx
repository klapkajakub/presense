"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Bot, Check, Copy, User2, Volume2, VolumeX } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useModal } from "@/components/modals/modal-context"
import { useDescriptions } from "@/components/descriptions/descriptions-context"
import { parseMessage } from "@/lib/chat/message-parser"
import type { Components } from 'react-markdown'
import { useSession } from "next-auth/react"

interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean
}

const MarkdownComponents: Components = {
    pre: ({ children }) => (
        <div className="relative my-2">
            <pre className="overflow-x-auto p-4 rounded bg-muted/50">
                {children}
            </pre>
        </div>
    ),
    code: ({ className, children }: CodeProps) => (
        <code className={cn(
            "bg-muted/50 rounded px-1 py-0.5",
            !className ? "text-sm" : "text-xs"
        )}>
            {children}
        </code>
    ),
    ul: ({ children }) => (
        <ul className="list-disc list-inside my-2">{children}</ul>
    ),
    ol: ({ children }) => (
        <ol className="list-decimal list-inside my-2">{children}</ol>
    ),
    p: ({ children }) => (
        <p className="mb-2">{children}</p>
    )
}

interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system'
  content: string
  highlight?: string
  messageId: string
}

export function ChatMessage({ role, content, highlight, messageId }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const { openModal } = useModal()
  const { updateDescription } = useDescriptions()
  const { data: session } = useSession()

  // Debug session data
  useEffect(() => {
    if (role === 'user') {
      console.log('Session data:', session)
      console.log('User avatar:', session?.user?.avatar)
    }
  }, [session, role])

  // Extract commands from content
  const { mainContent, commands } = parseMessage(content)

  // Execute commands only once and persist execution state
  useEffect(() => {
    const executeCommands = async () => {
      // Get executed commands from localStorage
      const executedCommands = JSON.parse(localStorage.getItem('executedCommands') || '{}')
      
      for (const cmd of commands) {
        // Create a unique key for this command using messageId
        const cmdKey = `${messageId}-${cmd.command}-${cmd.platform || ''}-${cmd.text || ''}`
        
        // Skip if already executed
        if (executedCommands[cmdKey]) continue
        
        // Mark as executed before running
        executedCommands[cmdKey] = true
        localStorage.setItem('executedCommands', JSON.stringify(executedCommands))
        
        switch (cmd.command) {
          case 'open-description':
            openModal('update-description')
            break
          case 'save-description':
            if (cmd.platform && cmd.text) {
              await updateDescription(cmd.platform, cmd.text)
            }
            break
        }
      }
    }

    executeCommands()
  }, [commands, openModal, updateDescription, messageId])

  // Handle copy function
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mainContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Handle speak function
  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    } else {
      const utterance = new SpeechSynthesisUtterance(mainContent)
      utterance.onend = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
      setIsSpeaking(true)
    }
  }

  // Highlight matching text if search is active
  const highlightText = (text: string) => {
    if (!highlight) return text

    const parts = text.split(new RegExp(`(${highlight})`, 'gi'))
    return parts.map((part, i) => 
      part.toLowerCase() === highlight.toLowerCase() ? 
        <span key={i} className="bg-yellow-200 dark:bg-yellow-900">{part}</span> : 
        part
    )
  }

  return (
    <div className={cn(
      "group flex gap-3 items-start",
      role === 'user' ? "justify-end" : "justify-start"
    )}>
      {role === 'assistant' && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        "flex flex-col gap-2",
        role === 'user' ? "items-end" : "items-start",
        "max-w-[80%]"
      )}>
        <div className={cn(
          "rounded-lg px-4 py-2",
          role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
          {role === 'user' ? (
            <div className="whitespace-pre-wrap">{highlightText(mainContent)}</div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  ...MarkdownComponents,
                  p: ({ children }) => (
                    <p className="mb-2">{highlightText(children as string)}</p>
                  ),
                  code: ({ inline, className, children }: CodeProps) => {
                    const codeContent = children as string
                    
                    if (inline) {
                      return <code className="bg-muted/50 rounded px-1 py-0.5 text-sm">
                        {highlightText(codeContent)}
                      </code>
                    }
                    
                    return <code className={cn(
                      "bg-muted/50 rounded px-1 py-0.5",
                      !className ? "text-sm" : "text-xs"
                    )}>
                      {children}
                    </code>
                  }
                }}
              >
                {mainContent}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {commands.map((cmd, i) => (
          <div key={i} className="rounded-lg px-3 py-2 bg-muted/30 border text-sm">
            {`${cmd.command}${cmd.platform ? ` ${cmd.platform}` : ''}${cmd.text ? ` "${cmd.text}"` : ''}`}
          </div>
        ))}

        {role === 'assistant' && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSpeak}>
              {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </div>

      {role === 'user' && (
        <Avatar className="h-8 w-8">
          <AvatarImage 
            src={session?.user?.avatar || ''} 
            alt="User avatar"
            onError={(e) => {
              console.error('Avatar load error:', e)
              const img = e.target as HTMLImageElement
              console.log('Failed avatar URL:', img.src)
            }}
          />
          <AvatarFallback>
            <User2 className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}