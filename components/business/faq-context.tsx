"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { toast } from 'sonner'

interface FAQ {
  id: string
  question: string
  answer: string
  expanded?: boolean
}

interface FAQContextType {
  faqs: FAQ[]
  usefulnessScore: number | null
  isLoading: boolean
  setFaqs: (faqs: FAQ[]) => void
  addFaq: (faq: FAQ) => void
  updateFaq: (id: string, field: 'question' | 'answer', value: string) => void
  removeFaq: (id: string) => void
  toggleFaqExpansion: (id: string) => void
  saveFaqs: () => Promise<void>
  generateFaqs: () => Promise<void>
  improveFaq: (id: string) => Promise<void>
}

const FAQContext = createContext<FAQContextType | undefined>(undefined)

export function useFAQ() {
  const context = useContext(FAQContext)
  if (!context) {
    throw new Error('useFAQ must be used within a FAQProvider')
  }
  return context
}

interface FAQProviderProps {
  children: ReactNode
  businessId?: string
}

export function FAQProvider({ children, businessId = 'default' }: FAQProviderProps) {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [usefulnessScore, setUsefulnessScore] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch FAQs on initial load
  useEffect(() => {
    const fetchFaqs = async () => {
      if (!businessId) return
      
      try {
        setIsLoading(true)
        const response = await fetch(`/api/faq?businessId=${businessId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch FAQs')
        }
        
        const data = await response.json()
        setFaqs(data.faqs.map((faq: any) => ({
          ...faq,
          id: faq._id || faq.id,
          expanded: false
        })))
        setUsefulnessScore(data.usefulnessScore)
      } catch (error) {
        console.error('Error fetching FAQs:', error)
        // Don't show error toast on initial load if there are no FAQs yet
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchFaqs()
  }, [businessId])

  // Add a new FAQ
  const addFaq = (faq: FAQ) => {
    setFaqs(prev => [...prev, faq])
  }

  // Update a FAQ
  const updateFaq = (id: string, field: 'question' | 'answer', value: string) => {
    setFaqs(prev => prev.map(faq => 
      faq.id === id ? { ...faq, [field]: value } : faq
    ))
  }

  // Remove a FAQ
  const removeFaq = (id: string) => {
    setFaqs(prev => prev.filter(faq => faq.id !== id))
  }

  // Toggle FAQ expansion
  const toggleFaqExpansion = (id: string) => {
    setFaqs(prev => prev.map(faq => 
      faq.id === id ? { ...faq, expanded: !faq.expanded } : faq
    ))
  }

  // Save FAQs
  const saveFaqs = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/faq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId,
          faqs: faqs.map(({ id, question, answer }) => ({ id, question, answer })),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save FAQs')
      }

      const data = await response.json()
      setUsefulnessScore(data.usefulnessScore)
      toast.success('FAQs saved successfully')
      return
    } catch (error) {
      console.error('Error saving FAQs:', error)
      toast.error('Failed to save FAQs')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Generate FAQs
  const generateFaqs = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/faq/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessId }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate FAQs')
      }

      const data = await response.json()
      // Ensure we only use at most 10 FAQs
      const generatedFaqs = data.faqs.slice(0, 10).map((faq: any) => ({
        id: Date.now() + Math.random().toString(36).substring(2, 9),
        question: faq.question,
        answer: faq.answer,
        expanded: false,
      }))

      setFaqs(generatedFaqs)
      toast.success('FAQs generated successfully')
      
      // Save the generated FAQs
      await saveFaqs()
    } catch (error) {
      console.error('Error generating FAQs:', error)
      toast.error('Failed to generate FAQs')
    } finally {
      setIsLoading(false)
    }
  }

  // Improve a specific FAQ
  const improveFaq = async (id: string) => {
    const faqToImprove = faqs.find(faq => faq.id === id)
    if (!faqToImprove) return

    try {
      setIsLoading(true)
      const response = await fetch('/api/faq/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId,
          faqId: id,
          question: faqToImprove.question,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to improve FAQ')
      }

      const data = await response.json()
      const improvedFaq = data.faq

      updateFaq(id, 'question', improvedFaq.question)
      updateFaq(id, 'answer', improvedFaq.answer)
      toast.success('FAQ improved successfully')
    } catch (error) {
      console.error('Error improving FAQ:', error)
      toast.error('Failed to improve FAQ')
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    faqs,
    usefulnessScore,
    isLoading,
    setFaqs,
    addFaq,
    updateFaq,
    removeFaq,
    toggleFaqExpansion,
    saveFaqs,
    generateFaqs,
    improveFaq,
  }

  return <FAQContext.Provider value={value}>{children}</FAQContext.Provider>
}