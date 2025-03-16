"use client"

import { useEffect } from "react"
import { useChat } from "./chat/chat-context"

export function KeyboardShortcuts() {
  const { toggleChat } = useChat()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        toggleChat()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [toggleChat])

  return null
}