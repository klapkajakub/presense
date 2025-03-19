"use client"

import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import { ModalProvider } from "./modals/modal-context"
import { ChatProvider } from "./chat/chat-context"
import { DescriptionsProvider } from "./descriptions/descriptions-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem
      disableTransitionOnChange
      storageKey="presense-theme"
    >
      <ModalProvider>
        <ChatProvider>
          <DescriptionsProvider>
            {children}
            <Toaster />
          </DescriptionsProvider>
        </ChatProvider>
      </ModalProvider>
    </ThemeProvider>
  )
}