"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Message } from '@/types/chat'
import { ActionCall } from '@/types/action'

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
  updateActionStatus: (messageId: string, actionIndex: number, status: 'pending' | 'success' | 'error', result?: any, error?: string) => void
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
      }),
      updateActionStatus: (messageId: string, actionIndex: number, status: 'pending' | 'success' | 'error', result?: any, error?: string) => set((state) => {
        // Find the message with the given ID
        const messageIndex = state.messages.findIndex(msg => msg.messageId === messageId);
        if (messageIndex === -1 || !state.messages[messageIndex].actions) return state;
        
        // Create a deep copy of messages to avoid direct state mutation
        const newMessages = [...state.messages];
        const message = {...newMessages[messageIndex]};
        
        // Ensure actions is properly initialized
        const actions = message.actions ? [...message.actions] : [];
        
        // Update the action at the given index
        if (actions[actionIndex]) {
          actions[actionIndex] = {
            ...actions[actionIndex],
            status,
            ...(result !== undefined && { result }),
            ...(error !== undefined && { error })
          };
          
          // Log action update for debugging
          console.log(`Updated action status: ${messageId}, index: ${actionIndex}, status: ${status}`);
        }
        
        // Update the message with the new actions array
        message.actions = actions;
        newMessages[messageIndex] = message;
        
        return { messages: newMessages };
      })
    }),
    {
      name: 'chat-storage',
    }
  )
)