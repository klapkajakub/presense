"use client"

import { usePathname } from 'next/navigation'
import { MainLayout } from "@/components/layout/main-layout"
import { UpdateDescriptionModal } from "@/components/modals/update-description-modal"
import { ChatButton } from "@/components/chat-button"
import { CommandMenu } from "@/components/command-menu"
import { ResizableChat } from "@/components/chat/resizable-chat"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Providers } from '@/components/providers'
import { SessionProvider } from '@/components/providers/session-provider'

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith('/auth')

  return (
    <SessionProvider>
      <Providers>
        <TooltipProvider>
          {isAuthPage ? (
            children
          ) : (
            <>
              <MainLayout>
                {children}
              </MainLayout>
              <UpdateDescriptionModal />
              <ChatButton />
              <CommandMenu />
              <ResizableChat />
            </>
          )}
        </TooltipProvider>
      </Providers>
    </SessionProvider>
  )
} 