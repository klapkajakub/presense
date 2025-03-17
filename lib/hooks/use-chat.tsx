"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ChatStore {
  isOpen: boolean
  width: number
  toggleChat: () => void
  setWidth: (width: number) => void
  closeChat: () => void
  openChat: () => void
}

export const useChat = create<ChatStore>()(
  persist(
    (set, get) => ({
      isOpen: false,
      width: 600,
      toggleChat: () => {
        console.log('Toggling chat. Current state:', get().isOpen)
        set((state) => ({ isOpen: !state.isOpen }))
      },
      setWidth: (width: number) => set({ width: Math.min(Math.max(width, 400), 800) }),
      closeChat: () => set({ isOpen: false }),
      openChat: () => set({ isOpen: true }),
    }),
    {
      name: 'chat-storage',
    }
  )
)