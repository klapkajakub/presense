"use client"

import { useState, useEffect } from 'react'
import { cn } from "@/lib/utils"
import { useChat } from "../chat/chat-context"
import { useModal } from "@/components/modals/modal-context"
import { UpdateDescriptionModal } from "@/components/modals/update-description-modal"

interface RootLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  header?: React.ReactNode
  chat?: React.ReactNode
}

export function RootLayout({ children, sidebar, header, chat }: RootLayoutProps) {
  const { isOpen, width, setWidth } = useChat()
  const [isDragging, setIsDragging] = useState(false)

  // Handle chat resize
  useEffect(() => {
    if (!isDragging) {
      document.body.style.cursor = ''
      return
    }

    document.body.style.cursor = 'ew-resize'

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      requestAnimationFrame(() => {
        const newWidth = window.innerWidth - e.clientX
        setWidth(newWidth)
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
    }
  }, [isDragging, setWidth])

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar */}
        {sidebar && (
          <aside className="w-64 border-r border-border">
            {sidebar}
          </aside>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          {header && (
            <header className="h-14 border-b border-border px-4">
              {header}
            </header>
          )}

          {/* Main Content */}
          <main 
            className="flex-1 relative overflow-auto transition-[margin] duration-300 ease-in-out"
            style={{ 
              marginRight: isOpen ? `${width}px` : 0 
            }}
          >
            {children}
          </main>

          {/* Chat Panel */}
          {chat && isOpen && (
            <aside 
              className="fixed top-0 right-0 h-full bg-background border-l border-border"
              style={{ width: `${width}px` }}
            >
              <div
                className="absolute left-0 top-0 w-1 h-full cursor-ew-resize hover:bg-muted-foreground/20 transition-colors"
                onMouseDown={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
              />
              {chat}
            </aside>
          )}
        </div>
      </div>
      
      {/* Add Modals */}
      <UpdateDescriptionModal />
    </>
  )
}