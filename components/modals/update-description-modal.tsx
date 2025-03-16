"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { useModal } from "./modal-context"
import { useDescriptions } from "../descriptions/descriptions-context"
import { PLATFORM_CONFIGS } from '@/types/business'

type Platform = keyof typeof PLATFORM_CONFIGS

export function UpdateDescriptionModal() {
  const { isOpen, type, closeModal } = useModal()
  const { descriptions, updateDescription } = useDescriptions()
  const open = isOpen && type === 'update-description'
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [improvingPlatform, setImprovingPlatform] = useState<Platform | null>(null)

  // Load descriptions on mount
  useEffect(() => {
    const loadDescriptions = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/descriptions')
        const data = await response.json()
        
        if (data.success) {
          Object.entries(data.data).forEach(([platform, content]) => {
            updateDescription(platform as Platform, content as string)
          })
        }
      } catch (error) {
        console.error('Failed to load descriptions:', error)
        toast.error('Failed to load descriptions')
      } finally {
        setIsLoading(false)
      }
    }

    if (open) {
      loadDescriptions()
    }
  }, [open, updateDescription])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const response = await fetch('/api/descriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descriptions })
      })

      if (!response.ok) throw new Error('Failed to save descriptions')
      
      toast.success('Descriptions saved successfully')
      closeModal()
    } catch (error) {
      console.error('Error saving descriptions:', error)
      toast.error('Failed to save descriptions')
    } finally {
      setIsSaving(false)
    }
  }

  const handleImprove = async (platform: Platform) => {
    try {
      setImprovingPlatform(platform)
      
      const response = await fetch('/api/improve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          currentText: descriptions[platform] || '',
          maxLength: PLATFORM_CONFIGS[platform].maxLength
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Network response was not ok')
      }

      if (!data.success) {
        throw new Error(data.message || 'Failed to improve text')
      }

      // Validate improved text length
      if (data.improvedText.length > PLATFORM_CONFIGS[platform].maxLength) {
        throw new Error('Improved text exceeds maximum length')
      }

      updateDescription(platform, data.improvedText)
      toast.success(`${PLATFORM_CONFIGS[platform].name} description improved`)

    } catch (error) {
      console.error('Error improving text:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to improve text')
    } finally {
      setImprovingPlatform(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={closeModal}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Update Platform Descriptions</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6">
          {Object.entries(PLATFORM_CONFIGS).map(([platform, config]) => (
            <div key={platform} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{config.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {config.description}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleImprove(platform as Platform)}
                  disabled={improvingPlatform === platform}
                >
                  {improvingPlatform === platform ? 'Improving...' : 'Improve'}
                </Button>
              </div>
              <Textarea
                value={descriptions[platform as Platform] || ''}
                onChange={(e) => updateDescription(platform as Platform, e.target.value)}
                placeholder={`Enter your ${config.name} description`}
                className="min-h-[100px]"
              />
              <div className="text-xs text-muted-foreground">
                {(descriptions[platform as Platform] || '').length} / {config.maxLength} characters
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}