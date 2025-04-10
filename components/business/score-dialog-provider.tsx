'use client'

import { ReactNode } from 'react'
import { InternetPresenceScoreWidget } from "./internet-presence-score-widget"

interface ScoreDialogProviderProps {
  children: ReactNode
}

export function ScoreDialogProvider({ children }: ScoreDialogProviderProps) {
  return (
    <>
      <div className="hidden">
        <InternetPresenceScoreWidget />
      </div>
      {children}
    </>
  )
} 