"use client"

import { Button } from "@/components/ui/button"
import { useModal } from "@/components/modals/modal-context"
import { ResizableChat } from "@/components/chat/resizable-chat"

export default function Home() {
  const { openModal } = useModal()

  return (
    <>
      <div className="flex flex-col gap-8 p-6">
        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage your business content across multiple platforms
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => openModal('update-description')}>
              Update Descriptions
            </Button>
          </div>
        </div>
      </div>
      <ResizableChat />
    </>
  )
}