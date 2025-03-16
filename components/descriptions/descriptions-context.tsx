"use client"

import { createContext, useContext, useState } from "react"
import { PlatformDescriptions } from "@/types/business"

interface DescriptionsContextType {
  descriptions: PlatformDescriptions
  updateDescription: (platform: keyof PlatformDescriptions, content: string) => void
}

const DescriptionsContext = createContext<DescriptionsContextType | undefined>(undefined)

export function DescriptionsProvider({ children }: { children: React.ReactNode }) {
  const [descriptions, setDescriptions] = useState<PlatformDescriptions>({
    gmb: "",
    fb: "",
    ig: ""
  })

  const updateDescription = (platform: keyof PlatformDescriptions, content: string) => {
    setDescriptions(prev => ({
      ...prev,
      [platform]: content
    }))
  }

  return (
    <DescriptionsContext.Provider value={{ descriptions, updateDescription }}>
      {children}
    </DescriptionsContext.Provider>
  )
}

export function useDescriptions() {
  const context = useContext(DescriptionsContext)
  if (!context) {
    throw new Error("useDescriptions must be used within DescriptionsProvider")
  }
  return context
}