"use client"

import { useState, useEffect } from 'react'
import { useChat } from './chat-context'
import { ChatView } from './chat-view'
import { Bot, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { IconContainer } from '../ui/icon-container'
import { faBrain, faXmark } from '@fortawesome/free-solid-svg-icons'

export function ResizableChat() {
  const { isOpen, width, setWidth, closeChat } = useChat()
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      const newWidth = window.innerWidth - e.clientX
      setWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.body.style.cursor = ''
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'ew-resize'

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
    }
  }, [isDragging, setWidth])

  return (
    <>
      {isDragging && (
        <div className="fixed inset-0 z-50" />
      )}

      <div 
        className={cn(
          "fixed top-0 h-full flex flex-col bg-background border-l border-border",
          "transition-all duration-300 ease-in-out transform",
          isOpen ? "translate-x-0" : "translate-x-full",
          "z-40"
        )}
        style={{ 
          width,
          right: 0
        }}
      >
        {/* Resize handle */}
        <div
          className="absolute left-0 top-0 w-4 h-full cursor-ew-resize hover:bg-sky-200/40 transition-colors z-50"
          onMouseDown={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          style={{ transform: 'translateX(-50%)' }}
        />

        {/* Header */}
        <header className="relative h-14 shrink-0 border-b border-border flex items-center justify-between px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2">
            <IconContainer icon="fa-solid fa-robot" size="md" />
            <span className="font-medium">Assistant</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeChat}
            className="h-8 w-8"
          >
            <IconContainer 
              icon="fa-solid fa-xmark" 
              size="md" 
              containerClassName="bg-transparent" 
            />
          </Button>
        </header>

        {/* Chat content */}
        <div className="flex-1 overflow-auto">
          <ChatView />
        </div>
      </div>
    </>
  )
}