"use client"

import { useState, useEffect, useRef, createContext, useContext } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { IconContainer } from "@/components/ui/icon-container"
import { useEnhancedBusiness } from "./enhanced-business-context"
import { Building2, Wand2, Globe, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PLATFORM_CONFIGS } from "@/types/business"

// Create a context to expose the dialog control and platform field references
interface BusinessDescriptionContextType {
  openDialog: (platform?: string) => void
  platformRefs: Record<string, React.RefObject<HTMLDivElement>>
}

export const BusinessDescriptionContext = createContext<BusinessDescriptionContextType>({
  openDialog: () => {},
  platformRefs: {}
})

export const useBusinessDescription = () => useContext(BusinessDescriptionContext)

interface EnhancedBusinessDescriptionWidgetProps {
  onClose?: () => void
}

export function EnhancedBusinessDescriptionWidget({ onClose }: EnhancedBusinessDescriptionWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isImproving, setIsImproving] = useState(false)
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({}) 
  const [isSaving, setIsSaving] = useState(false)
  const [platformVariants, setPlatformVariants] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState('main')
  const { businessInfo, updateDescription, updatePlatformDescription, fetchBusinessData } = useEnhancedBusiness()
  
  // Create refs for each platform field
  const platformRefs = Object.keys(PLATFORM_CONFIGS).reduce<Record<string, React.RefObject<HTMLDivElement>>>((acc, platform) => {
    acc[platform] = useRef<HTMLDivElement>(null)
    return acc
  }, {})

  // Load platform descriptions from context when dialog opens
  useEffect(() => {
    if (isOpen && businessInfo.platformDescriptions) {
      setPlatformVariants(businessInfo.platformDescriptions)
    }
  }, [isOpen, businessInfo.platformDescriptions])

  const handleImprove = async () => {
    try {
      setIsImproving(true)
      const response = await fetch('/api/improve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: businessInfo.description,
          platform: 'general'
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to improve text')

      updateDescription(data.text)
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
      setIsSaving(true)
      const response = await fetch('/api/business-description/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: businessInfo.description,
          platformDescriptions: platformVariants
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save description')
      }
      
      // Refresh business data
      await fetchBusinessData()
      toast.success('Business descriptions saved')
      setIsOpen(false)
      onClose?.()
    } catch (error) {
      console.error('Error saving description:', error)
      toast.error('Failed to save description')
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
        body: JSON.stringify({
          text: businessInfo.description,
          platform: PLATFORM_CONFIGS[platform].name,
          maxLength: PLATFORM_CONFIGS[platform].maxLength
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to generate platform variant')

      setPlatformVariants(prev => ({
        ...prev,
        [platform]: data.text
      }))
      updatePlatformDescription(platform, data.text)
      toast.success(`${PLATFORM_CONFIGS[platform].name} variant generated`)
    } catch (error) {
      console.error('Error generating platform variant:', error)
      toast.error('Failed to generate platform variant')
    } finally {
      setIsGenerating(prev => ({ ...prev, [platform]: false }))
    }
  }

  const preview = businessInfo.description?.length > 150 
    ? businessInfo.description.slice(0, 150) + '...'
    : businessInfo.description || ''

  // Function to open dialog and optionally switch to platforms tab and scroll to a specific platform
  const openDialog = (platform?: string) => {
    setIsOpen(true)
    
    if (platform) {
      // Switch to platforms tab
      setActiveTab('platforms')
      
      // Use setTimeout to ensure the dialog is open and the DOM is updated
      setTimeout(() => {
        // Scroll to the platform field
        if (platformRefs[platform]?.current) {
          platformRefs[platform].current?.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    }
  }
  
  // Context value
  const contextValue = {
    openDialog,
    platformRefs
  }
  
  return (
    <BusinessDescriptionContext.Provider value={contextValue}>
      <Card 
        className="cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => openDialog()}
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
            {businessInfo.description?.length || 0} characters
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="main">Main Description</TabsTrigger>
              <TabsTrigger value="platforms">Platform Variants</TabsTrigger>
            </TabsList>
            
            <TabsContent value="main" className="space-y-4">
              <Textarea
                value={businessInfo.description || ''}
                onChange={(e) => updateDescription(e.target.value)}
                placeholder="Enter your business description"
                className="min-h-[200px]"
              />
              <div className="text-xs text-muted-foreground">
                {businessInfo.description?.length || 0} characters
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={handleImprove}
                  disabled={isImproving || !businessInfo.description}
                >
                  {isImproving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Improving...
                    </>
                  ) : (
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
                <div key={platform} className="space-y-2" ref={platformRefs[platform]}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{config.name}</h4>
                      <p className="text-sm text-muted-foreground">{config.description}</p>
                    </div>
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
                    {platformVariants[platform]?.length > config.maxLength && (
                      <span className="text-red-500 ml-2">
                        Exceeds maximum length!
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>

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
    </BusinessDescriptionContext.Provider>
  )
}