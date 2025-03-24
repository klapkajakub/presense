"use client"

import { useState, useRef } from "react"
import { useChat } from "@/lib/hooks/use-chat"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  Send, 
  Bold, 
  Italic, 
  Code, 
  List
} from "lucide-react"
import { cn } from "@/lib/utils"

export function ChatInput() {
  const { addMessage } = useChat()
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Format buttons state
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isCode, setIsCode] = useState(false)
  const [isList, setIsList] = useState(false)

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    try {
      setIsLoading(true)
      addMessage({ role: 'user', content: input })
      setInput('')

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: input }] })
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

    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    
    // Check if start and end are valid numbers before using substring
    if (start === null || end === null || typeof start !== 'number' || typeof end !== 'number') return
    
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

  return (
    <div className="relative">
      {/* Formatting Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-border/50 mb-2">
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
  )
}