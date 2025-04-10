"use client"

import { ThemeProvider } from "next-themes"
import { ModalProvider } from "./modals/modal-context"
// Using zustand-based chat store instead of context
// import { ChatProvider } from "./chat/chat-context"
import { BusinessProvider } from "./business/business-context"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "sonner"
import { AuthProvider } from '@/lib/contexts/mock-auth-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <ModalProvider>
              <BusinessProvider>
                {children}
                <Toaster />
              </BusinessProvider>
            </ModalProvider>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
  )
}