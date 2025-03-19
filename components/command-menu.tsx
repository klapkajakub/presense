"use client"

import { useEffect, useState } from "react"
import { useChat } from "@/lib/hooks/use-chat"
import { useModal } from "@/components/modals/modal-context"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { MessageCircle, FileEdit, Settings } from "lucide-react"

export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const { openModal } = useModal()
  const { toggleChat, isOpen } = useChat()
  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
      // Change from Command+A to Command+P
      if (e.key.toLowerCase() === "p" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggleChat()
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [toggleChat])

  if (!session) {
    return null
  }

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() => runCommand(() => openModal("update-description"))}
          >
            <FileEdit className="mr-3 h-6 w-6" />
            <span>Update Business Descriptions</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => toggleChat())}
          >
            <MessageCircle className="mr-3 h-6 w-6" />
            <span>{isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/settings'))}
          >
            <Settings className="mr-3 h-6 w-6" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}