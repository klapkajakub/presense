"use client"

import { createContext, useContext, useState } from 'react'

interface ChatContextType {
  isOpen: boolean
  toggleChat: () => void
  closeChat: () => void
  openChat: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleChat = () => setIsOpen(prev => !prev)
  const closeChat = () => setIsOpen(false)
  const openChat = () => setIsOpen(true)

  return (
    <ChatContext.Provider value={{ isOpen, toggleChat, closeChat, openChat }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}