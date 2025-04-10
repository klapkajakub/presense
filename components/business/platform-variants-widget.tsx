"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IconContainer } from "@/components/ui/icon-container"
import { Globe, AlertCircle, Loader2, CheckCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useBusiness } from "./business-context"
import { PLATFORM_CONFIGS } from "@/types/business"

interface PlatformVariantsWidgetProps {
  onClose?: () => void;
}

export function PlatformVariantsWidget({ onClose }: PlatformVariantsWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [platformVariants, setPlatformVariants] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({})
  const { businessInfo, updatePlatformDescription, fetchBusinessData } = useBusiness()
  
  // Add event listener to open dialog from external components
  useEffect(() => {
    const handleOpenDialog = () => {
      setIsOpen(true);
    };
    document.addEventListener('open-platform-variants', handleOpenDialog);
    
    return () => {
      document.removeEventListener('open-platform-variants', handleOpenDialog);
    };
  }, []);
  
  // Initialize platform variants from business context
  useEffect(() => {
    if (businessInfo.platformDescriptions) {
      setPlatformVariants(businessInfo.platformDescriptions)
    }
  }, [businessInfo.platformDescriptions])

  // Check if a platform variant has issues
  const hasIssues = (platform: string, text?: string): boolean => {
    if (!text || text.trim() === '') return true
    if (text.length > PLATFORM_CONFIGS[platform].maxLength) return true
    return false
  }

  // Get platforms that need attention
  const getPlatformsWithIssues = (): string[] => {
    const platformsWithIssues: string[] = []
    
    Object.entries(PLATFORM_CONFIGS).forEach(([platform, config]) => {
      const variantText = platformVariants[platform] || businessInfo.platformDescriptions[platform] || ''
      if (hasIssues(platform, variantText)) {
        platformsWithIssues.push(platform)
      }
    })
    
    return platformsWithIssues
  }

  // Get a list of all platform keys
  const getAllPlatforms = (): string[] => {
    return Object.keys(PLATFORM_CONFIGS);
  }

  const platformsWithIssues = getPlatformsWithIssues()
  const allPlatforms = getAllPlatforms()
  
  // Check if all platforms have good content
  const allPlatformsGood = platformsWithIssues.length === 0;

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const response = await fetch('/api/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          description: businessInfo.description,
          platformVariants: platformVariants
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save descriptions')
      }
      
      // Refresh business data
      await fetchBusinessData()
      toast.success('Platform descriptions saved')
      setIsOpen(false)
      onClose?.()
    } catch (error) {
      console.error('Error saving descriptions:', error)
      toast.error('Failed to save descriptions')
    } finally {
      setIsSaving(false)
    }
  }

  const generatePlatformVariant = async (platform: string) => {
    try {
      setIsGenerating(prev => ({ ...prev, [platform]: true }))
      const response = await fetch('/api/improve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          currentText: businessInfo.description,
          maxLength: PLATFORM_CONFIGS[platform].maxLength,
          platform: PLATFORM_CONFIGS[platform].name
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to generate platform variant')

      // Handle both response field names for better compatibility
      const improvedText = data.improvedText || data.text
      if (!improvedText) throw new Error('No improved text returned')
      
      setPlatformVariants(prev => ({
        ...prev,
        [platform]: improvedText
      }))
      updatePlatformDescription(platform, improvedText)
      toast.success(`${PLATFORM_CONFIGS[platform].name} variant generated`)
    } catch (error) {
      console.error('Error generating platform variant:', error)
      toast.error('Failed to generate platform variant')
    } finally {
      setIsGenerating(prev => ({ ...prev, [platform]: false }))
    }
  }

  return (
    <>
      <Card 
        className={`cursor-pointer hover:bg-accent/50 transition-colors ${!allPlatformsGood ? 'border-amber-300' : ''}`}
        onClick={() => setIsOpen(true)}
      >
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconContainer 
              icon={allPlatformsGood ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-amber-500" />} 
            />
            <div>
              <CardTitle className="text-lg">Platform Descriptions</CardTitle>
              <CardDescription>
                {allPlatformsGood 
                  ? 'All platform descriptions are completed' 
                  : 'Some platform descriptions need attention'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {!allPlatformsGood && (
              <p className="text-sm text-muted-foreground">
                {platformsWithIssues.length} platform {platformsWithIssues.length === 1 ? 'variant' : 'variants'} need your attention
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {platformsWithIssues.map(platform => (
                <div 
                  key={platform}
                  className="bg-muted px-3 py-1 rounded-full text-xs flex items-center gap-1"
                >
                  <span>{PLATFORM_CONFIGS[platform].name}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Platform Descriptions</DialogTitle>
            <DialogDescription>
              Customize your business descriptions for different platforms
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 my-4">
            {allPlatforms.map(platform => {
              const config = PLATFORM_CONFIGS[platform]
              const variantText = platformVariants[platform] || businessInfo.platformDescriptions?.[platform] || ''
              const isEmpty = !variantText || variantText.trim() === ''
              const isTooLong = variantText.length > config.maxLength
              
              return (
                <div key={platform} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{config.name}</h4>
                      <p className="text-sm text-muted-foreground">{config.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generatePlatformVariant(platform)}
                        disabled={isGenerating[platform]}
                      >
                        {isGenerating[platform] ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Globe className="mr-2 h-4 w-4" />
                            Generate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {isEmpty && (
                    <div className="text-sm text-amber-500 flex items-center gap-1 mb-1">
                      <AlertCircle className="h-4 w-4" />
                      <span>This description is empty</span>
                    </div>
                  )}
                  
                  {isTooLong && (
                    <div className="text-sm text-red-500 flex items-center gap-1 mb-1">
                      <AlertCircle className="h-4 w-4" />
                      <span>Exceeds maximum length of {config.maxLength} characters</span>
                    </div>
                  )}
                  
                  <Textarea
                    value={variantText}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      // Update local state
                      setPlatformVariants(prev => ({
                        ...prev,
                        [platform]: newValue
                      }));
                      // Also update in the global context
                      updatePlatformDescription(platform, newValue);
                    }}
                    placeholder={`${config.name} description (max ${config.maxLength} characters)`}
                    className={`min-h-[100px] ${isTooLong ? 'border-red-500' : isEmpty ? 'border-amber-500' : ''}`}
                  />
                  
                  <div className="flex justify-end">
                    <div className="text-xs text-muted-foreground">
                      {variantText.length} / {config.maxLength} characters
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : 'Save All'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}