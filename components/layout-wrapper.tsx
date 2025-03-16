"use client"

import { useChat } from "./chat/chat-context"
import { cn } from "@/lib/utils"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isOpen, width } = useChat()

  return (
    <div
      className="w-full transition-[margin] duration-300 ease-in-out"
      style={{
        marginRight: isOpen ? `${width}px` : 0
      }}
    >
      {children}
    </div>
  )
}