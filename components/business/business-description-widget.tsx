"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { IconContainer } from "@/components/ui/icon-container"
import { useBusiness } from "./business-context"
import { Building2, Wand2, Globe } from "lucide-react"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PLATFORM_CONFIGS } from "@/types/business"

interface BusinessDescriptionWidgetProps {
  onClose?: () => void
}

export function BusinessDescriptionWidget({ onClose }: BusinessDescriptionWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isImproving, setIsImproving] = useState(false)
  const [platformVariants, setPlatformVariants] = useState<Record<string, string>>({})
  const { businessInfo, updateDescription } = useBusiness()

  const handleImprove = async () => {
    try {
      setIsImproving(true)
      const response = await fetch('/api/improve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentText: businessInfo.description,
          maxLength: 2000 // Maximum length for base description
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to improve text')

      updateDescription(data.improvedText)
      toast.success('Business description improved')
    } catch (error) {
      console.error('Error improving text:', error)
      toast.error('Failed to improve description')
    } finally {
      setIsImproving(false)
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: businessInfo.description,
          platformVariants
        })
      })

      if (!response.ok) throw new Error('Failed to save description')
      toast.success('Business description saved')
      setIsOpen(false)
      onClose?.()
    } catch (error) {
      console.error('Error saving description:', error)
      toast.error('Failed to save description')
    }
  }

  const generatePlatformVariant = async (platform: string) => {
    try {
      const response = await fetch('/api/improve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentText: businessInfo.description,
          maxLength: PLATFORM_CONFIGS[platform].maxLength,
          platform: PLATFORM_CONFIGS[platform].name
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to generate platform variant')

      setPlatformVariants(prev => ({
        ...prev,
        [platform]: data.improvedText
      }))
      toast.success(`${PLATFORM_CONFIGS[platform].name} variant generated`)
    } catch (error) {
      console.error('Error generating platform variant:', error)
      toast.error('Failed to generate platform variant')
    }
  }

  const preview = businessInfo.description.length > 150 
    ? businessInfo.description.slice(0, 150) + '...'
    : businessInfo.description

  return (
    <>
      <Card 
        className="cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setIsOpen(true)}
      >
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconContainer icon={<Building2 className="h-5 w-5" />} />
            <div>
              <CardTitle className="text-lg">Business Description</CardTitle>
              <CardDescription>Core description of your business</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {preview || 'No description set'}
          </p>
          <div className="mt-2 text-xs text-muted-foreground">
            {businessInfo.description.length} characters
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Business Description</DialogTitle>
            <DialogDescription>
              Set your main business description and generate platform-specific variants
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="main" className="space-y-4">
            <TabsList>
              <TabsTrigger value="main">Main Description</TabsTrigger>
              <TabsTrigger value="platforms">Platform Variants</TabsTrigger>
            </TabsList>
            
            <TabsContent value="main" className="space-y-4">
              <Textarea
                value={businessInfo.description}
                onChange={(e) => updateDescription(e.target.value)}
                placeholder="Enter your business description"
                className="min-h-[200px]"
              />
              <div className="text-xs text-muted-foreground">
                {businessInfo.description.length} characters
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={handleImprove}
                  disabled={isImproving || !businessInfo.description}
                >
                  {isImproving ? 'Improving...' : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Improve
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="platforms" className="space-y-4">
              {Object.entries(PLATFORM_CONFIGS).map(([platform, config]) => (
                <div key={platform} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{config.name}</h4>
                      <p className="text-sm text-muted-foreground">{config.description}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generatePlatformVariant(platform)}
                    >
                      <Globe className="mr-2 h-4 w-4" />
                      Generate
                    </Button>
                  </div>
                  <Textarea
                    value={platformVariants[platform] || ''}
                    onChange={(e) => setPlatformVariants(prev => ({
                      ...prev,
                      [platform]: e.target.value
                    }))}
                    placeholder={`${config.name} description (max ${config.maxLength} characters)`}
                    className="min-h-[100px]"
                  />
                  <div className="text-xs text-muted-foreground">
                    {platformVariants[platform]?.length || 0} / {config.maxLength} characters
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button onClick={handleSave}>
              Save All
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 