"use client"

import { useAuth } from '@/lib/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

export function SettingsForm() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.get('email'),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update settings')
      }

      // Handle success
    } catch (error) {
      console.error('Error updating settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={user.email}
          disabled={isLoading}
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save changes'}
      </Button>
    </form>
  )
} 