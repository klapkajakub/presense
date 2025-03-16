"use client"

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { useChat } from "./chat-context"
import { ChatView } from "./chat-view"

export function ChatSheet() {
    const { isOpen, closeChat } = useChat()

    return (
        <Sheet open={isOpen} onOpenChange={closeChat}>
            <SheetContent 
                side="right" 
                className="w-screen md:w-[600px] lg:w-[800px] p-0 max-w-[min(100vw,800px)]"
                style={{ "--speech-bubble-edge-spacing": "24px" } as React.CSSProperties}
            >
                <SheetHeader className="p-6 pb-4 border-b">
                    <SheetTitle>Chat with AI Assistant</SheetTitle>
                </SheetHeader>
                <div className="h-[calc(100vh-8rem)]">
                    <ChatView />
                </div>
            </SheetContent>
        </Sheet>
    )
}