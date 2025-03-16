"use client"

import { createContext, useContext, useState, useEffect } from 'react'

interface ChatContextType {
  isOpen: boolean
  width: number
  setWidth: (width: number) => void
  toggleChat: () => void
  closeChat: () => void
  openChat: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [width, setWidth] = useState(600)

  // Load saved state on mount
  useEffect(() => {
    const savedWidth = localStorage.getItem('chatWidth')
    const savedIsOpen = localStorage.getItem('chatIsOpen')
    
    if (savedWidth) setWidth(Number(savedWidth))
    if (savedIsOpen) setIsOpen(savedIsOpen === 'true')
  }, [])

  const handleSetWidth = (newWidth: number) => {
    const constrainedWidth = Math.min(Math.max(newWidth, 400), 800)
    setWidth(constrainedWidth)
    localStorage.setItem('chatWidth', String(constrainedWidth))
  }

  const toggleChat = () => {
    const newState = !isOpen
    setIsOpen(newState)
    localStorage.setItem('chatIsOpen', String(newState))
  }

  const closeChat = () => {
    setIsOpen(false)
    localStorage.setItem('chatIsOpen', 'false')
  }

  const openChat = () => {
    setIsOpen(true)
    localStorage.setItem('chatIsOpen', 'true')
  }

  return (
    <ChatContext.Provider value={{
      isOpen,
      width,
      setWidth: handleSetWidth,
      toggleChat,
      closeChat,
      openChat
    }}>
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