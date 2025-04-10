"use client"

import { usePathname } from 'next/navigation'
import { MainLayout } from "@/components/layout/main-layout"
import { ChatButton } from "@/components/chat-button"
import { CommandMenu } from "@/components/command-menu"
import { ResizableChat } from "@/components/chat/resizable-chat"
import { useChat } from "@/lib/hooks/use-chat"
import { NavBar } from "@/components/layout/navbar"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isOpen, width } = useChat()
  
  // Auth pages don't need the additional UI components
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  return (
    <>
      <NavBar />
      <MainLayout style={{ paddingRight: isOpen ? `${width}px` : 0 }}>
        {children}
        {!isAuthPage && (
          <>
            <ChatButton />
            <CommandMenu />
            {isOpen && <ResizableChat />}
          </>
        )}
      </MainLayout>
    </>
  )
}