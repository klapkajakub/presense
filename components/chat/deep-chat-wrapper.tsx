"use client"

import { useEffect, useState } from 'react'
import Script from 'next/script'

export function DeepChatWrapper() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Initialize DeepChat only after the script is loaded
    if (isLoaded && window.DeepChat) {
      new window.DeepChat({
        container: '#deep-chat-container',
        request: {
          url: '/api/chat',
          additionalHeaders: {
            'Content-Type': 'application/json',
          }
        },
        style: {
          borderRadius: '0.5rem',
          height: '100%',
          border: '1px solid var(--border)'
        }
      })
    }
  }, [isLoaded])

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/deep-chat@1.4.9/dist/deepChat.bundle.js"
        onLoad={() => setIsLoaded(true)}
      />
      <div id="deep-chat-container" style={{ height: '100%' }} />
    </>
  )
}