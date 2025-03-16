"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { useChat } from "./chat/chat-context"

export function ChatButton() {
  const { isOpen, toggleChat } = useChat()

  return (
    <Button
      variant="default"
      size="icon"
      className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all"
      onClick={toggleChat}
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  )
}