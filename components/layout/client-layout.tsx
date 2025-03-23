"use client"

import { usePathname } from 'next/navigation'
import { MainLayout } from "@/components/layout/main-layout"
import { ChatButton } from "@/components/chat-button"
import { CommandMenu } from "@/components/command-menu"
import { ResizableChat } from "@/components/chat/resizable-chat"
import { useChat } from "@/lib/hooks/use-chat"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isOpen, width } = useChat()
  // Auth pages have been removed

  return (
    <MainLayout style={{ paddingRight: isOpen ? `${width}px` : 0 }}>
      {children}
      <ChatButton />
      <CommandMenu />
      {isOpen && <ResizableChat />}
    </MainLayout>
  )
}