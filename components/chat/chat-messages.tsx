"use client"

import { useEffect, useRef } from "react"
import { ChatMessage } from "./chat-message"
import { Message } from "@/types/chat"

interface ChatMessagesProps {
  messages: Message[]
  highlight?: string
}

export function ChatMessages({ messages, highlight }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <ChatMessage
          key={`${message.role}-${index}`}
          messageId={`${message.role}-${index}`}
          role={message.role}
          content={message.content}
          highlight={highlight}
          image={message.image}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}