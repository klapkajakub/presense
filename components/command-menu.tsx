"use client"

import { useEffect, useState } from "react"
import { 
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import { useModal } from "./modals/modal-context"
import { useChat } from "./chat/chat-context"
import { MessageCircle, FileEdit } from "lucide-react"

export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const { openModal } = useModal()
  const { isOpen, toggleChat } = useChat()

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
  }, [toggleChat]) // Add toggleChat to dependency array

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
            <FileEdit className="mr-2 h-4 w-4" />
            <span>Update Business Descriptions</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => toggleChat())}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            <span>{isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}