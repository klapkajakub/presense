"use client"

import { ThemeProvider } from "next-themes"
import { ModalProvider } from "@/components/modals/modal-context"
import { DescriptionsProvider } from "@/components/descriptions/descriptions-context"
import { SettingsProvider } from "@/lib/hooks/settings-context"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SettingsProvider>
        <ModalProvider>
          <DescriptionsProvider>
            {children}
          </DescriptionsProvider>
        </ModalProvider>
      </SettingsProvider>
    </ThemeProvider>
  )
} 