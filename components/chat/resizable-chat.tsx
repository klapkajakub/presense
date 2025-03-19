"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@/lib/hooks/use-chat"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  Send, 
  Search, 
  Bold, 
  Italic, 
  Code, 
  List,
  History,
  X,
  Bot
} from "lucide-react"
import { ChatMessage } from "./chat-message"
import { useSession } from "next-auth/react"
import { ChatView } from "./chat-view"

const MIN_WIDTH = 400
const MAX_WIDTH = 800

export function ResizableChat() {
  const { isOpen, width, setWidth, closeChat, messages, addMessage, toggleChat } = useChat()
  const { data: session } = useSession()
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showHistory, setShowHistory] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const dragStartX = useRef<number>(0)
  const dragStartWidth = useRef<number>(0)
  
  // Format buttons state
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isCode, setIsCode] = useState(false)
  const [isList, setIsList] = useState(false)

  // Handle resize drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      e.preventDefault()

      requestAnimationFrame(() => {
        const dragDistance = dragStartX.current - e.clientX
        const newWidth = dragStartWidth.current + dragDistance
        setWidth(Math.min(Math.max(newWidth, MIN_WIDTH), MAX_WIDTH))
      })
    }

    const handleMouseUp = () => {
      if (!isDragging) return
      setIsDragging(false)
      document.body.style.removeProperty('user-select')
      document.body.style.removeProperty('cursor')
    }

    if (isDragging) {
      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'ew-resize'
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.removeProperty('user-select')
      document.body.style.removeProperty('cursor')
    }
  }, [isDragging, setWidth])

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault()
    dragStartX.current = e.clientX
    dragStartWidth.current = width
    setIsDragging(true)
  }

  // Filter messages based on search query
  const filteredMessages = messages.filter(msg => 
    msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Auto scroll to bottom on new message, but not when searching
  useEffect(() => {
    if (scrollRef.current && !isSearching) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isSearching])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    try {
      setIsLoading(true)
      addMessage({ role: 'user', content: input })
      setInput('')

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: input }] })
      })

      const data = await response.json()
      if (data.success) {
        addMessage({ role: 'assistant', content: data.response })
      }
    } catch (error) {
      console.error('Chat error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatText = (format: 'bold' | 'italic' | 'code' | 'list') => {
    const formats = {
      bold: '**',
      italic: '_',
      code: '`',
      list: '- '
    }

    const textarea = document.querySelector('textarea')
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = input.substring(start, end)
    const beforeText = input.substring(0, start)
    const afterText = input.substring(end)

    if (format === 'list') {
      setInput(beforeText + '\n- ' + selectedText + afterText)
      setIsList(true)
      return
    }

    const marker = formats[format]
    setInput(beforeText + marker + selectedText + marker + afterText)

    switch (format) {
      case 'bold': setIsBold(true); break
      case 'italic': setIsItalic(true); break
      case 'code': setIsCode(true); break
    }

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + marker.length,
        end + marker.length
      )
    }, 0)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!session) {
    return null
  }

  if (!isOpen) {
    return null
  }

  return (
    <>
      {isDragging && <div className="fixed inset-0 z-50" />}

      <div 
        className={cn(
          "fixed inset-y-0 right-0 bg-background z-50 flex flex-col h-screen",
          isDragging && "pointer-events-none"
        )}
        style={{ 
          width,
          transition: isDragging ? 'none' : 'width 300ms ease-in-out'
        }}
      >
        {/* Resize Handle */}
        <div
          className={cn(
            "absolute left-0 inset-y-0 w-4 cursor-ew-resize hover:bg-border/40 transition-colors z-50",
            isDragging && "bg-border/40"
          )}
          onMouseDown={handleDragStart}
          onClick={e => e.stopPropagation()}
          style={{ pointerEvents: 'auto' }}
        />

        {/* Main Chat Container */}
        <div className="flex flex-col h-full border-l border-border">
          {/* Header - Fixed Height */}
          <header className="flex-none border-b border-border">
            {/* Header Content */}
            <div className="flex items-center justify-between h-14 px-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">AI Assistant</span>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-9 w-9"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  <History className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-9 w-9"
                  onClick={() => setIsSearching(!isSearching)}
                >
                  <Search className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-9 w-9" 
                  onClick={closeChat}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>

          {/* Search Bar - Conditional */}
          {isSearching && (
            <div className="flex-none border-b border-border p-2">
              <Input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          )}

          {/* Messages - Scrollable */}
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="flex flex-col gap-4 p-4" ref={scrollRef}>
                {(searchQuery ? filteredMessages : messages).map((msg, i) => (
                  <ChatMessage key={i} {...msg} highlight={searchQuery} />
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Footer - Fixed Height */}
          <footer className="flex-none border-t border-border">
            {/* Formatting Toolbar */}
            <div className="flex items-center gap-1 px-4 py-2 border-b border-border/50">
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button 
                    size="icon" 
                    variant="ghost"
                    className={cn("h-8 w-8", isBold && "bg-muted")}
                    onClick={() => formatText('bold')}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Bold</TooltipContent>
              </Tooltip>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button 
                    size="icon" 
                    variant="ghost"
                    className={cn("h-8 w-8", isItalic && "bg-muted")}
                    onClick={() => formatText('italic')}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Italic</TooltipContent>
              </Tooltip>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button 
                    size="icon" 
                    variant="ghost"
                    className={cn("h-8 w-8", isCode && "bg-muted")}
                    onClick={() => formatText('code')}
                  >
                    <Code className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Code</TooltipContent>
              </Tooltip>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button 
                    size="icon" 
                    variant="ghost"
                    className={cn("h-8 w-8", isList && "bg-muted")}
                    onClick={() => formatText('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">List</TooltipContent>
              </Tooltip>
            </div>

            {/* Input Area */}
            <div className="p-4">
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  placeholder="Type a message..."
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  className="resize-none pr-12 py-3 max-h-48"
                />
                <Button 
                  size="icon"
                  className="absolute right-2 bottom-2 h-8 w-8"
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  )
}