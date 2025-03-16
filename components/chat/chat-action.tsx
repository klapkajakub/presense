"use client"

import { Button } from "@/components/ui/button"
import { IconContainer } from "@/components/ui/icon-container"
import { useModal } from "@/components/modals/modal-context"
import { useDescriptions } from "@/components/descriptions/descriptions-context"
import { PLATFORM_CONFIGS } from "@/types/business"
import { toast } from "sonner"

interface ChatActionProps {
  command: string
  content?: string
  platform?: keyof typeof PLATFORM_CONFIGS
}

export function ChatAction({ command, content, platform }: ChatActionProps) {
  const { openModal } = useModal()
  const { updateDescription } = useDescriptions()

  const handleAction = async () => {
    switch (command) {
      case 'open-description':
        openModal('update-description')
        break
      case 'save-description':
        if (platform && content) {
          try {
            await updateDescription(platform, content)
            const response = await fetch('/api/descriptions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                descriptions: { [platform]: content }
              })
            })
            
            if (!response.ok) throw new Error('Failed to save description')
            toast.success(`${PLATFORM_CONFIGS[platform].name} description updated`)
          } catch (error) {
            toast.error('Failed to save description')
          }
        }
        break
    }
  }

  return (
    <Button
      variant="outline"
      className="w-full flex items-center gap-2 bg-background"
      onClick={handleAction}
    >
      <IconContainer icon="fa-solid fa-terminal" size="sm" />
      <span>Execute: {command}</span>
    </Button>
  )
}