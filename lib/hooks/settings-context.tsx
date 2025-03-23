"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/mock-auth-context'

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
  const { user } = useAuth()

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Use user data for initial settings
        if (user) {
          setSettings({
            avatar: undefined, // Add avatar handling if needed
            // Add other settings from user if needed
          })
        }
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to load settings:', error)
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [user])

  return (
    <SettingsContext.Provider value={{ settings, setSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}