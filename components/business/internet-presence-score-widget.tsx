'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { IconContainer } from "@/components/ui/icon-container"
import { Button } from "@/components/ui/button"
import { useBusiness } from "./business-context"
import { useFAQ } from "./faq-context"
import { BarChart3, AlertCircle, Building2, HelpCircle, Globe } from "lucide-react"
import { PLATFORM_CONFIGS } from "@/types/business"

// Create a context to allow external access to the dialog
interface ScoreDialogContextType {
  openDialog: () => void;
}

const ScoreDialogContext = createContext<ScoreDialogContextType>({
  openDialog: () => {},
});

export const useScoreDialog = () => useContext(ScoreDialogContext);

interface InternetPresenceScoreWidgetProps {
  onClose?: () => void
}

export function InternetPresenceScoreWidget({ onClose }: InternetPresenceScoreWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [score, setScore] = useState<number>(0)
  const [improvements, setImprovements] = useState<string[]>([])
  const [needsAttention, setNeedsAttention] = useState<{
    description: boolean;
    platforms: string[];
    faqs: boolean;
  }>({
    description: false,
    platforms: [],
    faqs: false
  })

  const { businessInfo } = useBusiness()
  const { faqs, usefulnessScore } = useFAQ()

  // Calculate the Internet Presence Score based on available information
  useEffect(() => {
    calculateScore()
  }, [businessInfo, faqs, usefulnessScore])

  const calculateScore = () => {
    let totalScore = 0
    const improvementsList: string[] = []
    const attention = {
      description: false,
      platforms: [] as string[],
      faqs: false
    }

    // Check business description (worth 30 points)
    const descriptionScore = calculateDescriptionScore(businessInfo.description)
    totalScore += descriptionScore
    
    if (descriptionScore < 25) {
      attention.description = true
      improvementsList.push("Enhance your business description with more details about your services, values, and unique selling points.")
    }

    // Check platform descriptions (worth 40 points)
    const platformScore = calculatePlatformScore(businessInfo.platformDescriptions)
    totalScore += platformScore.score
    
    if (platformScore.missingPlatforms.length > 0) {
      attention.platforms = platformScore.missingPlatforms
      improvementsList.push(`Add or improve descriptions for ${platformScore.missingPlatforms.map(p => PLATFORM_CONFIGS[p].name).join(', ')}.`)
    }

    // Check FAQs (worth 30 points)
    const faqScore = calculateFAQScore(faqs, usefulnessScore)
    totalScore += faqScore
    
    if (faqScore < 20) {
      attention.faqs = true
      improvementsList.push("Add more comprehensive FAQs to address common customer questions.")
    }

    setScore(Math.round(totalScore))
    setImprovements(improvementsList)
    setNeedsAttention(attention)
  }

  const calculateDescriptionScore = (description: string): number => {
    if (!description) return 0
    
    // Simple scoring based on length and content
    const lengthScore = Math.min(20, description.length / 25)
    
    // Check for keywords that indicate quality content
    const qualityIndicators = [
      'service', 'customer', 'quality', 'experience', 'professional',
      'value', 'mission', 'vision', 'team', 'expert', 'solution'
    ]
    
    const qualityScore = qualityIndicators.reduce((score, word) => {
      return score + (description.toLowerCase().includes(word) ? 1 : 0)
    }, 0)
    
    return Math.min(30, lengthScore + qualityScore)
  }

  const calculatePlatformScore = (platformDescriptions: Record<string, string>) => {
    const platforms = Object.keys(PLATFORM_CONFIGS)
    let score = 0
    const missingPlatforms: string[] = []
    
    platforms.forEach(platform => {
      const description = platformDescriptions[platform] || ''
      const config = PLATFORM_CONFIGS[platform]
      
      if (!description || description.trim() === '') {
        missingPlatforms.push(platform)
      } else if (description.length > config.maxLength) {
        // Penalize for exceeding max length
        score += 5
        missingPlatforms.push(platform)
      } else {
        // Score based on description length relative to max length
        const platformScore = Math.min(10, (description.length / config.maxLength) * 10)
        score += platformScore
      }
    })
    
    return { score: Math.min(40, score), missingPlatforms }
  }

  const calculateFAQScore = (faqs: any[], usefulnessScore: number | null): number => {
    if (!faqs || faqs.length === 0) return 0
    if (usefulnessScore !== null) return (usefulnessScore / 100) * 30
    
    // Fallback calculation if usefulnessScore is not available
    const faqCount = Math.min(10, faqs.length)
    const faqCountScore = faqCount * 2
    
    // Calculate average question and answer length
    const avgQuestionLength = faqs.reduce((sum, faq) => sum + (faq.question?.length || 0), 0) / faqs.length
    const avgAnswerLength = faqs.reduce((sum, faq) => sum + (faq.answer?.length || 0), 0) / faqs.length
    
    const contentScore = Math.min(10, (avgQuestionLength / 10) + (avgAnswerLength / 30))
    
    return Math.min(30, faqCountScore + contentScore)
  }

  // Get color class based on score
  const getScoreColorClass = (score: number): string => {
    if (score >= 80) return 'bg-emerald-400'
    if (score >= 60) return 'bg-green-300'
    if (score >= 40) return 'bg-amber-200'
    if (score >= 20) return 'bg-orange-200'
    return 'bg-red-300'
  }

  // Function to open the dialog from external components
  const openDialog = () => setIsOpen(true);

  // Initialize dialog context
  const contextValue = {
    openDialog,
  };

  // Handlers for opening related component dialogs
  const handleOpenDescription = () => {
    // Close current dialog and trigger business description widget
    setIsOpen(false);
    const event = new CustomEvent('open-business-description');
    document.dispatchEvent(event);
  };

  const handleOpenPlatformDescriptions = () => {
    // Close current dialog and trigger platform descriptions widget
    setIsOpen(false);
    const event = new CustomEvent('open-platform-variants');
    document.dispatchEvent(event);
  };

  const handleOpenFAQs = () => {
    // Close current dialog and trigger FAQ configurator widget
    setIsOpen(false);
    const event = new CustomEvent('open-faq-configurator');
    document.dispatchEvent(event);
  };

  return (
    <ScoreDialogContext.Provider value={contextValue}>
      <Card 
        className="cursor-pointer hover:bg-accent/50 transition-colors w-full mb-6 border border-border bg-card text-card-foreground"
        onClick={() => setIsOpen(true)}
      >
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconContainer icon={<BarChart3 className="h-5 w-5" />} />
            <div>
              <CardTitle className="text-lg">Internet Presence Score</CardTitle>
              <CardDescription>Overall quality of your online presence</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-foreground">Score:</div>
              <div className="h-4 w-full rounded-full bg-muted">
                <div 
                  className={`h-full rounded-full ${getScoreColorClass(score)}`} 
                  style={{ width: `${score}%` }}
                />
              </div>
              <div className="text-sm font-medium text-foreground">{score}/100</div>
            </div>
            
            {improvements.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Click to see {improvements.length} improvement suggestion{improvements.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Internet Presence Score: {score}/100</DialogTitle>
            <DialogDescription>
              Detailed analysis of your online presence quality
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 my-4">
            {/* Score visualization */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Overall Score</h3>
              <div className="h-6 w-full rounded-full bg-gray-200">
                <div 
                  className={`h-full rounded-full ${getScoreColorClass(score)}`} 
                  style={{ width: `${score}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>0</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>
            </div>
            
            {/* Improvement suggestions */}
            {improvements.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Improvement Suggestions</h3>
                <ul className="space-y-2">
                  {improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Areas that need attention */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Areas Needing Attention</h3>
              
              {/* Business Description */}
              {needsAttention.description && (
                <Card 
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={handleOpenDescription}
                >
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <IconContainer icon={<Building2 className="h-5 w-5" />} />
                      <div>
                        <CardTitle className="text-base">Business Description</CardTitle>
                        <CardDescription>Enhance your core business description</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              )}
              
              {/* Platform Descriptions */}
              {needsAttention.platforms.length > 0 && (
                <Card 
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={handleOpenPlatformDescriptions}
                >
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <IconContainer icon={<Globe className="h-5 w-5" />} />
                      <div>
                        <CardTitle className="text-base">Platform Descriptions</CardTitle>
                        <CardDescription>
                          Update descriptions for {needsAttention.platforms.map(p => PLATFORM_CONFIGS[p].name).join(', ')}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              )}
              
              {/* FAQs */}
              {needsAttention.faqs && (
                <Card 
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={handleOpenFAQs}
                >
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <IconContainer icon={<HelpCircle className="h-5 w-5" />} />
                      <div>
                        <CardTitle className="text-base">FAQ Configurator</CardTitle>
                        <CardDescription>Add more comprehensive FAQs</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ScoreDialogContext.Provider>
  )
}