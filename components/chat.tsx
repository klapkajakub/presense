"use client"

import { useChat } from "@/lib/hooks/use-chat"

export function Chat() {
  const { isOpen, width } = useChat()

  if (!isOpen) return null

  return (
    <div 
      className="fixed bottom-20 right-4 bg-white rounded-lg shadow-xl"
      style={{ width: width }}
    >
      {/* Chat content goes here */}
    </div>
  )
}