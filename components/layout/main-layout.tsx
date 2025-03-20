"use client"

import { useAuth } from '@/lib/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Sidebar } from "@/components/layout/sidebar"
import { UserMenu } from "@/components/user-menu"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/signin')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Presense</h1>
          </div>
          <UserMenu />
        </header>
        <main 
          className="flex-1 relative overflow-auto transition-[margin] duration-300 ease-in-out"
        >
          {children}
        </main>
      </div>
    </div>
  )
} 