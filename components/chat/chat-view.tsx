"use client"

import { useChat } from "@/lib/hooks/use-chat"
import { useModal } from "@/components/modals/modal-context"
import { useBusiness } from "@/components/business/business-context"
import { ChatMessage } from "./chat-message"
import { ChatInput } from "./chat-input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { History, Search, X } from "lucide-react"

export function ChatView() {
  const { messages, isOpen, toggleChat } = useChat()
  const { openModal } = useModal()
  const { updateDescription } = useBusiness()

  const handleDescriptionCommand = async (platform: string, text: string) => {
    await updateDescription(text)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <History className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Search className="h-5 w-5" />
          </Button>
        </div>
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleChat}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              role={message.role}
              content={message.content}
              messageId={`${message.role}-${index}`}
            />
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <ChatInput />
      </div>
    </div>
  )
}