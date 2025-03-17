"use client"

import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Bot, Check, Copy, User2, Volume2, VolumeX } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useModal } from "@/components/modals/modal-context"
import { useDescriptions } from "@/components/descriptions/descriptions-context"

interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const { openModal } = useModal()
  const { updateDescription } = useDescriptions()

  // Extract commands from content
  const { mainContent, commands } = parseContent(content)

  // Execute commands
  useState(() => {
    commands.forEach(async ({ command, platform, text }) => {
      switch (command) {
        case 'open-description':
          openModal('update-description')
          break
        case 'save-description':
          if (platform && text) {
            await updateDescription(platform, text)
          }
          break
      }
    })
  }, [content])

  return (
    <div className="group flex gap-3 items-start">
      {role === 'assistant' && (
        <Avatar>
          <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
        </Avatar>
      )}
      
      <div className="flex flex-col gap-2 max-w-[80%]">
        <div className={cn(
          "rounded-lg px-4 py-2",
          role === 'user' ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"
        )}>
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            className="prose prose-sm dark:prose-invert"
          >
            {mainContent}
          </ReactMarkdown>
        </div>

        {commands.map((cmd, i) => (
          <div key={i} className="rounded-lg px-3 py-2 bg-muted/30 border text-sm">
            {`${cmd.command}${cmd.platform ? ` ${cmd.platform}` : ''}${cmd.text ? ` "${cmd.text}"` : ''}`}
          </div>
        ))}

        {role === 'assistant' && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" onClick={() => handleCopy(content)}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSpeak}>
              {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </div>

      {role === 'user' && (
        <Avatar>
          <AvatarFallback><User2 className="h-4 w-4" /></AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}

function parseContent(content: string) {
  const parts = content.split('***')
  const mainContent = parts[0]
  const commands = parts.slice(1).map(cmd => {
    const match = cmd.match(/^(save-description|open-description)(?:\s+(\w+)\s+"([^"]+)")?/)
    return match ? {
      command: match[1],
      platform: match[2],
      text: match[3]
    } : null
  }).filter(Boolean)

  return { mainContent, commands }
}