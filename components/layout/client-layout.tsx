"use client"

import { usePathname } from 'next/navigation'
import { MainLayout } from "@/components/layout/main-layout"
import { ChatButton } from "@/components/chat-button"
import { CommandMenu } from "@/components/command-menu"
import { ResizableChat } from "@/components/chat/resizable-chat"
import { useChat } from "@/lib/hooks/use-chat"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isOpen } = useChat()
  const isAuthPage = pathname === '/auth/signin' || pathname === '/auth/signup'

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <MainLayout>
      {children}
      <ChatButton />
      <CommandMenu />
      {isOpen && <ResizableChat />}
    </MainLayout>
  )
} 