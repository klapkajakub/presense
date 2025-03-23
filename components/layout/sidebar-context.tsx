"use client"

import { createContext, useContext, useState, useEffect } from 'react'

interface SidebarContextType {
  width: number
  setWidth: (width: number) => void
  isDragging: boolean
  setIsDragging: (isDragging: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [width, setWidth] = useState(250)
  const [isDragging, setIsDragging] = useState(false)

  // Load saved state on mount
  useEffect(() => {
    const savedWidth = localStorage.getItem('sidebarWidth')
    if (savedWidth) setWidth(Number(savedWidth))
  }, [])

  const handleSetWidth = (newWidth: number) => {
    const constrainedWidth = Math.min(Math.max(newWidth, 200), 400)
    setWidth(constrainedWidth)
    localStorage.setItem('sidebarWidth', String(constrainedWidth))
  }

  return (
    <SidebarContext.Provider value={{
      width,
      setWidth: handleSetWidth,
      isDragging,
      setIsDragging
    }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}