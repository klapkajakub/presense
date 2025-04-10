import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'

// Use mock auth for development
const MOCK_USER = {
  id: 'mock-user-id',
  email: 'user@example.com'
};

export async function POST(request: Request) {
  try {
    // Use mock user for authentication in development
    const user = MOCK_USER;

    // Parse request body
    const body = await request.json()
    const { currentText, maxLength, platform } = body

    if (!currentText?.trim()) {
      return NextResponse.json(
        { error: 'Missing required text content' },
        { status: 400 }
      )
    }

    // Create better platform-specific or general improvements
    // Simplified but more realistic enhancement logic
    const baseText = currentText.trim()
    let improvedText = baseText

    // Generate platform-specific or general enhancement
    if (platform) {
      // Platform-specific enhancements
      const maxChars = maxLength || 1000
      const platformName = platform.toLowerCase()
      
      // Append platform-specific enhancements based on character count and platform
      if (platformName.includes('google')) {
        // Google Business Profile - focus on local search and services
        improvedText = enhanceForGoogle(baseText, maxChars)
      } 
      else if (platformName.includes('facebook')) {
        // Facebook - more conversational and engaging
        improvedText = enhanceForFacebook(baseText, maxChars)
      }
      else if (platformName.includes('instagram')) {
        // Instagram - more visual and emotional
        improvedText = enhanceForInstagram(baseText, maxChars)
      }
      else if (platformName.includes('firmy')) {
        // Firmy.cz - more straightforward and brief
        improvedText = enhanceForFirmy(baseText, maxChars)
      }
      else {
        // Generic platform improvement
        improvedText = enhanceGeneric(baseText, maxChars)
      }
    } else {
      // General description improvement
      const maxChars = maxLength || 2000
      improvedText = enhanceGeneric(baseText, maxChars)
    }

    return NextResponse.json({
      improvedText: improvedText
    })

  } catch (error) {
    console.error('Improvement error:', error)
    return NextResponse.json(
      { error: 'Improvement failed - please try again' },
      { status: 500 }
    )
  }
}

// Helper functions for different platforms
function enhanceForGoogle(text: string, maxChars: number): string {
  const serviceWords = ['services', 'quality', 'local', 'professional', 'experienced', 'trusted']
  const randomService = serviceWords[Math.floor(Math.random() * serviceWords.length)]
  
  // Add location focus and services for Google
  let enhanced = `${text}. We provide ${randomService} solutions in the local area.`
  
  // Truncate if too long
  if (enhanced.length > maxChars) {
    enhanced = enhanced.substring(0, maxChars - 3) + '...'
  }
  
  return enhanced
}

function enhanceForFacebook(text: string, maxChars: number): string {
  const emotionalWords = ['passionate', 'dedicated', 'committed', 'proud', 'excited']
  const randomEmotion = emotionalWords[Math.floor(Math.random() * emotionalWords.length)]
  
  // More conversational for Facebook
  let enhanced = `${text}. We're ${randomEmotion} to serve our community! Connect with us and share your experiences.`
  
  // Truncate if too long
  if (enhanced.length > maxChars) {
    enhanced = enhanced.substring(0, maxChars - 3) + '...'
  }
  
  return enhanced
}

function enhanceForInstagram(text: string, maxChars: number): string {
  const hashTags = ['#localbusiness', '#quality', '#community', '#service', '#trusted']
  const randomTags = [...hashTags].sort(() => 0.5 - Math.random()).slice(0, 3).join(' ')
  
  // More visual and hashtag-focused for Instagram
  let enhanced = `${text}. Follow our journey! ${randomTags}`
  
  // Truncate if too long
  if (enhanced.length > maxChars) {
    enhanced = enhanced.substring(0, maxChars - 3) + '...'
  }
  
  return enhanced
}

function enhanceForFirmy(text: string, maxChars: number): string {
  // More straightforward and concise for Firmy.cz
  let enhanced = text
  
  // Make it more concise if longer than half the max length
  if (enhanced.length > maxChars / 2) {
    enhanced = enhanced.split('.').slice(0, 2).join('.') + '.'
  }
  
  // Add business category if still short enough
  if (enhanced.length < maxChars - 30) {
    enhanced += ' Professional business services available.'
  }
  
  // Truncate if too long
  if (enhanced.length > maxChars) {
    enhanced = enhanced.substring(0, maxChars - 3) + '...'
  }
  
  return enhanced
}

function enhanceGeneric(text: string, maxChars: number): string {
  const enhancementPhrases = [
    'We are committed to providing excellent service.',
    'Quality and customer satisfaction are our top priorities.',
    'Contact us today to learn more about our offerings.',
    'We look forward to serving your needs.',
    'Our experienced team is ready to assist you.'
  ]
  
  const randomPhrase = enhancementPhrases[Math.floor(Math.random() * enhancementPhrases.length)]
  
  // General enhancement
  let enhanced = `${text}. ${randomPhrase}`
  
  // Truncate if too long
  if (enhanced.length > maxChars) {
    enhanced = enhanced.substring(0, maxChars - 3) + '...'
  }
  
  return enhanced
}