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
  List,
  Image as ImageIcon,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Message } from "@/types/chat"

export function ChatInput() {
  const { addMessage } = useChat()
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Format buttons state
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isCode, setIsCode] = useState(false)
  const [isList, setIsList] = useState(false)

  const handleSend = async () => {
    if ((!input.trim() && !imageFile) || isLoading) return

    try {
      setIsLoading(true)
      
      let imageUrl = null
      
      // Upload image if exists
      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        const uploadData = await uploadResponse.json()
        if (uploadData.success) {
          imageUrl = uploadData.filePath
        }
      }
      
      // Add user message to chat UI
      const userMessage: Message = { 
        role: 'user' as const, 
        content: input, 
        image: imageUrl 
      };
      addMessage(userMessage);
      
      // Clear input and image
      setInput('')
      setImageFile(null)
      setImagePreview(null)

      // Get the current chat history
      const { messages } = useChat.getState();
      
      // Send message to API with full conversation history
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: messages
        })
      })

      const data = await response.json()
      if (data.success) {
        // Generate a unique message ID for the assistant's message
        const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        
        console.log('Received actions from API:', data.actions)
        
        // Add the assistant's message with any actions
        addMessage({ 
          role: 'assistant', 
          content: data.response,
          messageId,
          actions: data.actions
        })
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }
    
    setImageFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }
  
  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button 
              size="icon" 
              variant="ghost"
              className="h-8 w-8 ml-auto"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-4 w-4" />
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Upload Image</TooltipContent>
        </Tooltip>
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="relative mb-2 inline-block">
          <img 
            src={imagePreview} 
            alt="Preview" 
            className="h-20 rounded-md object-cover" 
          />
          <Button 
            size="icon" 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0"
            onClick={removeImage}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

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
        disabled={isLoading || (!input.trim() && !imageFile)}
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  )
}