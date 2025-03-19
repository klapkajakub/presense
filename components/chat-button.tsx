"use client"

import { useSession } from "next-auth/react"
import { useChat } from "@/lib/hooks/use-chat"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

export function ChatButton() {
  const { toggleChat, isOpen } = useChat()
  const { data: session } = useSession()

  if (!session) {
    return null
  }

  return (
    <Button
      onClick={toggleChat}
      size="icon"
      className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="sr-only">Toggle chat</span>
    </Button>
  )
}