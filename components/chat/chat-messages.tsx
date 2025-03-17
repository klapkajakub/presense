import { useChat } from "@/lib/hooks/use-chat"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessage } from "./chat-message"

export function ChatMessages() {
  const { messages } = useChat()

  return (
    <ScrollArea className="flex-1">
      <div className="flex-1 p-4 space-y-4">
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            role={message.role}
            content={message.content}
            isCommand={message.content.includes('***')}
          />
        ))}
      </div>
    </ScrollArea>
  )
}