"use client"

import { Button } from "@/components/ui/button"
import { useModal } from "@/components/modals/modal-context"
import { ChatButton } from "@/components/chat-button"
import { ChatSheet } from "@/components/chat/chat-sheet"

export default function Home() {
  const { openModal } = useModal()

  return (
    <main className="relative min-h-screen">
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-8">
        <Button onClick={() => openModal('update-description')}>
          Open Description Modal
        </Button>
        <ChatButton />
      </div>
      <ChatSheet />
    </main>
  )
}