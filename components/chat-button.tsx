"use client"

import { useAuth } from '@/lib/contexts/mock-auth-context'
import { useChat } from "@/lib/hooks/use-chat"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

export function ChatButton() {
  const { user } = useAuth()
  const { toggleChat } = useChat()

  if (!user) return null

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleChat}
      className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg"
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  )
}