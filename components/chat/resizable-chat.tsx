"use client"

import { useState } from "react"
import { useChat } from "@/lib/hooks/use-chat"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { IconContainer } from "@/components/ui/icon-container"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"
import { ChatMessage } from "./chat-message"

export function ResizableChat() {
  const { isOpen, width, setWidth, closeChat, messages, addMessage } = useChat()
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    try {
      setIsLoading(true)
      addMessage({ role: 'user', content: input })
      setInput('')

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: input }] })
      })

      const data = await response.json()
      if (data.success) {
        addMessage({ role: 'assistant', content: data.response })
      }
    } catch (error) {
      console.error('Chat error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn(
      "fixed inset-y-0 right-0 flex flex-col bg-background border-l",
      "transition-transform duration-300",
      isOpen ? "translate-x-0" : "translate-x-full"
    )}
    style={{ width }}>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <IconContainer icon="fa-solid fa-robot" />
          <span className="font-medium">AI Assistant</span>
        </div>
        <Button variant="ghost" size="icon" onClick={closeChat}>
          <IconContainer icon="fa-solid fa-xmark" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <ChatMessage key={i} {...msg} />
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <form onSubmit={(e) => {
          e.preventDefault()
          handleSend()
        }}
        className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[80px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}