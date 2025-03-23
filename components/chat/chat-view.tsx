"use client"

import { useChat } from "@/lib/hooks/use-chat"
import { useModal } from "@/components/modals/modal-context"
import { ChatMessage } from "./chat-message"
import { ChatInput } from "./chat-input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { History, Search, X } from "lucide-react"
import { useEffect, useState } from "react"

export function ChatView() {
  const { messages, isOpen, toggleChat } = useChat()
  const { openModal } = useModal()
  const [scrollAttempts, setScrollAttempts] = useState(0)

  // Force scroll to bottom using multiple techniques
  useEffect(() => {
    if (!isOpen) return;
    
    // Create a function to try all possible scrolling methods
    const forceScrollToBottom = () => {
      // Method 1: Using data attribute
      document.querySelectorAll('[data-slot="scroll-area-viewport"]').forEach(element => {
        if (element instanceof HTMLElement) {
          element.scrollTop = element.scrollHeight;
        }
      });
      
      // Method 2: Find any scrollable element in our chat view
      document.querySelectorAll('.flex-1.p-4 [style*="overflow"]').forEach(element => {
        if (element instanceof HTMLElement) {
          element.scrollTop = element.scrollHeight;
        }
      });
    };
    
    // Execute immediately
    forceScrollToBottom();
    
    // Then try with increasing intervals up to 10 attempts
    if (scrollAttempts < 10) {
      const timer = setTimeout(() => {
        forceScrollToBottom();
        setScrollAttempts(prev => prev + 1);
      }, 100 * (scrollAttempts + 1));
      
      return () => clearTimeout(timer);
    }
  }, [messages, isOpen, scrollAttempts]);

  // Reset scroll attempts when chat closes
  useEffect(() => {
    if (!isOpen) {
      setScrollAttempts(0);
    }
  }, [isOpen]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <History className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Search className="h-5 w-5" />
          </Button>
        </div>
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleChat}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              role={message.role}
              content={message.content}
              messageId={`${message.role}-${index}`}
            />
          ))}
          {/* This div is for visibility purposes only since we're using direct DOM manipulation */}
          <div id="messages-end" />
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <ChatInput />
      </div>
    </div>
  )
}