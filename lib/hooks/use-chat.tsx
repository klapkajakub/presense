"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Message } from '@/types/chat'

interface ChatStore {
  isOpen: boolean
  width: number
  messages: Message[]
  toggleChat: () => void
  setWidth: (width: number) => void
  closeChat: () => void
  openChat: () => void
  addMessage: (message: Message) => void
  clearMessages: () => void
}

export const useChat = create<ChatStore>()(
  persist(
    (set, get) => ({
      isOpen: false,
      width: 600,
      messages: [
        { role: 'assistant', content: "Hello! How can I help you today?" }
      ],
      toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
      setWidth: (width: number) => set({ width: Math.min(Math.max(width, 400), 800) }),
      closeChat: () => set({ isOpen: false }),
      openChat: () => set({ isOpen: true }),
      addMessage: (message: Message) => set((state) => ({
        messages: [...state.messages, message]
      })),
      clearMessages: () => set({ 
        messages: [{ role: 'assistant', content: "Hello! How can I help you today?" }]
      })
    }),
    {
      name: 'chat-storage',
    }
  )
)