"use client"

import { RootLayout } from "@/components/layout/root-layout"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { ResizableChat } from "@/components/chat/resizable-chat"
import { Button } from "@/components/ui/button"
import { useModal } from "@/components/modals/modal-context"
import { ChatButton } from "@/components/chat-button"

export default function Home() {
  const { openModal } = useModal()

  return (
    <RootLayout
      header={<Header />}
      sidebar={<Sidebar />}
    >
      <div className="flex flex-col items-center justify-center min-h-full p-8">
        <Button onClick={() => openModal('update-description')}>
          Open Description Modal
        </Button>
        <ChatButton />
      </div>
      <ResizableChat />
    </RootLayout>
  )
}