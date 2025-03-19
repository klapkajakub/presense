"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Settings {
  avatar?: string
  // Add other settings as needed
}

interface SettingsContextType {
  settings: Settings | null
  setSettings: (settings: Settings) => void
  isLoading: boolean
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { data: session } = useSession()

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Use session data for initial settings
        if (session?.user) {
          setSettings({
            avatar: session.user.avatar || undefined,
            // Add other settings from session if needed
          })
        }
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to load settings:', error)
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [session])

  return (
    <SettingsContext.Provider value={{ settings, setSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  )
} 