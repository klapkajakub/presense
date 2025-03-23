"use client"

import { ThemeProvider } from "next-themes"
import { ModalProvider } from "./modals/modal-context"
import { ChatProvider } from "./chat/chat-context"
import { BusinessProvider } from "./business/business-context"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "sonner"
import { AuthProvider } from '@/lib/contexts/auth-context'
import { SessionProvider } from "next-auth/react"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <ModalProvider>
              <ChatProvider>
                <BusinessProvider>
                  {children}
                  <Toaster />
                </BusinessProvider>
              </ChatProvider>
            </ModalProvider>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </SessionProvider>
  )
}