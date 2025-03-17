import { useChat } from "./chat-context"
import { ChatMessage } from "./chat-message"

export function ChatMessages() {
  const { messages } = useChat()

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <ChatMessage
          key={index}
          role={message.role}
          content={message.content}
          isCommand={message.content.includes('***')}
        />
      ))}
    </div>
  )
}