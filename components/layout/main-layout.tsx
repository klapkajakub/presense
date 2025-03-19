"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { useChat } from "@/lib/hooks/use-chat"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isOpen, width } = useChat()
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-72 md:flex-col border-r border-border">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div 
          className="border-b border-border"
          style={{ 
            marginRight: isOpen ? `${width}px` : 0,
            transition: 'margin-right 300ms ease-in-out'
          }}
        >
          <Header />
        </div>

        {/* Main Content */}
        <main 
          className="flex-1 relative overflow-y-auto"
          style={{ 
            marginRight: isOpen ? `${width}px` : 0,
            transition: 'margin-right 300ms ease-in-out'
          }}
        >
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 