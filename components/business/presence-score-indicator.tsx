'use client'

import { useState, useEffect } from 'react'
import { useBusiness } from "./business-context"
import { useFAQ } from "./faq-context"
import { useScoreDialog } from "./internet-presence-score-widget"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { PLATFORM_CONFIGS } from "@/types/business"

export function PresenceScoreIndicator() {
  const [score, setScore] = useState<number>(0)
  const { businessInfo } = useBusiness()
  const { faqs, usefulnessScore } = useFAQ()
  const { openDialog } = useScoreDialog()

  // Calculate the Internet Presence Score based on available information
  useEffect(() => {
    calculateScore()
  }, [businessInfo, faqs, usefulnessScore])

  const calculateScore = () => {
    let totalScore = 0
    
    // Check business description (worth 30 points)
    const descriptionScore = calculateDescriptionScore(businessInfo.description)
    totalScore += descriptionScore
    
    // Check platform descriptions (worth 40 points)
    const platformScore = calculatePlatformScore(businessInfo.platformDescriptions)
    totalScore += platformScore.score
    
    // Check FAQs (worth 30 points)
    const faqScore = calculateFAQScore(faqs, usefulnessScore)
    totalScore += faqScore
    
    setScore(Math.round(totalScore))
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

  const calculatePlatformScore = (platformDescriptions: Record<string, string> | undefined) => {
    const platforms = Object.keys(PLATFORM_CONFIGS)
    let score = 0
    const missingPlatforms: string[] = []
    
    platforms.forEach(platform => {
      const description = platformDescriptions?.[platform] || ''
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

  // Get color class based on score for the stroke
  const getScoreColorClass = (score: number): string => {
    if (score >= 80) return 'stroke-emerald-400'
    if (score >= 60) return 'stroke-green-300'
    if (score >= 40) return 'stroke-amber-200'
    if (score >= 20) return 'stroke-orange-200'
    return 'stroke-red-300'
  }

  // Calculate the stroke-dasharray and stroke-dashoffset for the SVG circle
  // to represent the score as a circular progress
  const radius = 11; // Slightly smaller than the container to account for stroke width
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            onClick={openDialog}
            className="flex items-center justify-center ml-2 cursor-pointer"
          >
            <div className="relative h-6 w-6 flex items-center justify-center">
              {/* Black background circle */}
              <div className="absolute inset-0 rounded-full bg-black"></div>
              
              {/* SVG for circular progress */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24">
                <circle 
                  cx="12" 
                  cy="12" 
                  r={radius} 
                  fill="none" 
                  strokeWidth="2"
                  className={getScoreColorClass(score)}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90 12 12)"
                />
              </svg>
              
              {/* Score text */}
              <span className="relative text-[10px] font-bold text-white">{score}</span>
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Internet Presence Score: {score}/100</p>
          <p className="text-xs text-muted-foreground">Click to view details</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
} 