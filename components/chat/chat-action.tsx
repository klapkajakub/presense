"use client"

import { useModal } from "@/components/modals/modal-context"
import { useBusiness } from "@/components/business/business-context"
import { Button } from "@/components/ui/button"
import { IconContainer } from "@/components/ui/icon-container"

interface ChatActionProps {
  command: string
  platform?: string
  content?: string
}

export function ChatAction({ command, platform, content }: ChatActionProps) {
  const { openModal } = useModal()
  const { updateDescription } = useBusiness()

  const handleAction = async () => {
    switch (command) {
      case 'open-description':
        openModal('business-description')
        break
      case 'save-description':
        if (content) {
          await updateDescription(content)
        }
        break
    }
  }

  return (
    <div className="flex items-start gap-3">
      <div className="flex-1">
        <div className="rounded-lg px-4 py-2 bg-background border flex items-center gap-2">
          <IconContainer 
            icon="fa-solid fa-terminal" 
            size="sm"
            containerClassName="bg-primary/5" 
          />
          <span className="text-sm text-muted-foreground">
            {command === 'open-description' ? 'Opening business description editor...' : 'Saving business description...'}
          </span>
        </div>
      </div>
    </div>
  )
}