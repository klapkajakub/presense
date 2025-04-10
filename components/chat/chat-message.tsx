"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Bot, Check, Copy, User2, Volume2, VolumeX } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useModal } from "@/components/modals/modal-context"
import { useBusiness } from "@/components/business/business-context"
import { parseMessage } from "@/lib/chat/message-parser"
import type { Components } from 'react-markdown'
import { useAuth } from '@/lib/contexts/mock-auth-context'
import { Message } from '@/types/chat'
import { UserAvatar } from '@/components/user-avatar'
import { ActionCall } from '@/types/action'
import { ChatActionCard } from './chat-action-card'

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
  role: 'system' | 'user' | 'assistant';
  content: string;
  messageId?: string;
  highlight?: string;
  image?: string;
  actions?: ActionCall[];
}

export function ChatMessage({ role, content, messageId, highlight, image, actions }: ChatMessageProps)  {
  const { user } = useAuth()
  const isUser = role === 'user'
  const [copied, setCopied] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const { openModal } = useModal()
  const { updateDescription } = useBusiness()

  // Extract commands from content
  const { mainContent, commands } = parseMessage(content)

  // Execute commands only once and persist execution state
  useEffect(() => {
    const executeCommands = async () => {
      // Get executed commands from localStorage
      const executedCommands = JSON.parse(localStorage.getItem('executedCommands') || '{}')
      
      for (const cmd of commands) {
        // Create a unique key for this command using messageId or a fallback
        const cmdId = messageId || 'unknown'
        const cmdKey = `${cmdId}-${cmd.command}-${cmd.platform || ''}-${cmd.text || ''}`
        
        // Skip if already executed
        if (executedCommands[cmdKey]) continue
        
        // Mark as executed before running
        executedCommands[cmdKey] = true
        localStorage.setItem('executedCommands', JSON.stringify(executedCommands))
        
        switch (cmd.command) {
          case 'open-description':
            console.log('Opening modal from command parsing');
            openModal('business-description')
            break
          case 'open-business-hours':
            console.log('Opening business hours modal from command parsing');
            openModal('business-hours')
            break
          case 'save-description':
            if (cmd.platform && cmd.text) {
              await updateDescription(cmd.text)
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
    <div
      className={cn(
        'flex w-full items-start gap-4 p-4',
        isUser ? 'bg-muted/50' : 'bg-background'
      )}
    >
      <div className="flex-shrink-0">
        {isUser ? (
          <UserAvatar user={user!} size="sm" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            AI
          </div>
        )}
      </div>
      <div className="flex-1 space-y-2">
        <div className="prose prose-sm dark:prose-invert">
          {image && (
            <div className="mb-2">
              <img src={image} alt="Uploaded image" className="rounded-md max-w-full max-h-[300px] object-contain" />
            </div>
          )}
          {isUser ? (
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
        
        {/* Render action cards */}
        {actions && actions.length > 0 && actions.map((action, index) => {
          // Create a state update function for this specific action
          const updateActionStatus = async (actionId: string, parameters: Record<string, any>) => {
            try {
              // Call the action execution API
              const response = await fetch('/api/actions/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ actionId, parameters })
              });
              
              const data = await response.json();
              
              if (!response.ok) {
                throw new Error(data.error || 'Failed to execute action');
              }
              
              console.log('Action execution response:', data);
              
              // Handle specific actions based on the result
              if (data.success && data.result) {
                const result = data.result;
                
                // Handle modal opening actions
                if (result.action === 'open-modal' && result.modalType) {
                  console.log(`Opening modal: ${result.modalType}`);
                  openModal(result.modalType);
                }
                
                // Handle save description action
                if (result.action === 'save-description' && parameters.content) {
                  await updateDescription(parameters.content);
                }
              }
              
              // Update the action in the UI
              action.status = 'success';
              action.result = data.result;
              
              // Force a re-render using a custom event
              const event = new CustomEvent('action-updated', { 
                detail: { 
                  messageId, 
                  actionIndex: index, 
                  status: 'success', 
                  result: data.result 
                } 
              });
              window.dispatchEvent(event);
              
              return data.result;
            } catch (error) {
              console.error('Error executing action:', error);
              
              // Update the action status to error
              action.status = 'error';
              action.error = error instanceof Error ? error.message : 'Unknown error';
              
              // Force a re-render using a custom event
              const event = new CustomEvent('action-updated', { 
                detail: { 
                  messageId, 
                  actionIndex: index, 
                  status: 'error', 
                  error: error instanceof Error ? error.message : 'Unknown error' 
                } 
              });
              window.dispatchEvent(event);
              
              throw error;
            }
          };
          
          return (
            <ChatActionCard 
              key={`${messageId}-action-${index}`} 
              action={action} 
              onExecute={updateActionStatus}
            />
          );
        })}

        <div className="flex gap-1 opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSpeak}>
            {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}