'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { IconContainer } from "@/components/ui/icon-container"
import { HelpCircle, Wand2, ChevronDown, ChevronUp, Plus, Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useFAQ } from "./faq-context"

interface FAQConfiguratorWidgetProps {
  onClose?: () => void
}

export function FAQConfiguratorWidget({ onClose }: FAQConfiguratorWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isImprovingFaq, setIsImprovingFaq] = useState<Record<string, boolean>>({})
  const bottomRef = useRef<HTMLDivElement>(null)
  const [newQuestion, setNewQuestion] = useState('')
  const [newAnswer, setNewAnswer] = useState('')
  const [expandedFAQs, setExpandedFAQs] = useState<Record<string, boolean>>({})
  
  const {
    faqs,
    usefulnessScore,
    isLoading,
    addFaq,
    updateFaq,
    removeFaq,
    toggleFaqExpansion,
    saveFaqs,
    generateFaqs,
    improveFaq
  } = useFAQ()

  // Add event listener to open dialog from external components
  useEffect(() => {
    const handleOpenDialog = () => setIsOpen(true);
    document.addEventListener('open-faq-configurator', handleOpenDialog);
    
    return () => {
      document.removeEventListener('open-faq-configurator', handleOpenDialog);
    };
  }, []);

  // Add a new FAQ
  const handleAddFaq = () => {
    const newFaq = {
      id: Date.now().toString(),
      question: '',
      answer: '',
      expanded: true
    }
    addFaq(newFaq)
    
    // Scroll to the bottom after state update
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  // Improve a specific FAQ using AI
  const handleImproveFaq = async (id: string) => {
    try {
      setIsImprovingFaq(prev => ({ ...prev, [id]: true }))
      await improveFaq(id)
    } catch (error) {
      console.error('Error improving FAQ:', error)
    } finally {
      setIsImprovingFaq(prev => ({ ...prev, [id]: false }))
    }
  }

  // Save FAQs and close dialog
  const handleSave = async () => {
    try {
      await saveFaqs()
      setIsOpen(false)
      onClose?.()
    } catch (error) {
      console.error('Error saving FAQs:', error)
    }
  }

  return (
    <>
      <Card 
        className="cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setIsOpen(true)}
      >
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconContainer icon={<HelpCircle className="h-5 w-5" />} />
            <div>
              <CardTitle className="text-lg">FAQ Configurator</CardTitle>
              <CardDescription>Manage frequently asked questions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              {faqs.length === 0 
                ? 'No FAQs configured yet' 
                : `${faqs.length} FAQ${faqs.length === 1 ? '' : 's'} configured`}
            </p>
            {usefulnessScore !== null && (
              <div className="flex items-center gap-2">
                <div className="text-xs font-medium">Usefulness Score:</div>
                <div className="h-2 w-full max-w-[100px] rounded-full bg-gray-200">
                  <div 
                    className={`h-full rounded-full ${getScoreColorClass(usefulnessScore)}`} 
                    style={{ width: `${usefulnessScore}%` }}
                  />
                </div>
                <div className="text-xs font-medium">{usefulnessScore}%</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>FAQ Configurator</DialogTitle>
            <DialogDescription>
              Create and manage frequently asked questions for your business
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* FAQ List */}
            <div className="space-y-4">
              {faqs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No FAQs added yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add FAQs manually or generate them automatically
                  </p>
                </div>
              ) : (
                <div className="space-y-4 divide-y">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="pt-4 first:pt-0">
                      <div 
                        className="flex items-center justify-between cursor-pointer" 
                        onClick={() => toggleFaqExpansion(faq.id)}
                      >
                        <div className="flex-1">
                          <Input
                            value={faq.question}
                            onChange={(e) => updateFaq(faq.id, 'question', e.target.value)}
                            placeholder="Enter question"
                            className="border-none text-lg font-medium p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleImproveFaq(faq.id)
                            }}
                            disabled={isImprovingFaq[faq.id] || isLoading}
                          >
                            {isImprovingFaq[faq.id] ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Improving...
                              </>
                            ) : (
                              <>
                                <Wand2 className="mr-2 h-4 w-4" />
                                Generate
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeFaq(faq.id)
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFaqExpansion(faq.id)
                            }}
                          >
                            {faq.expanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      {faq.expanded && (
                        <div className="mt-2">
                          <Textarea
                            value={faq.answer}
                            onChange={(e) => updateFaq(faq.id, 'answer', e.target.value)}
                            placeholder="Enter answer"
                            className="min-h-[100px]"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Sticky bottom actions */}
            <div className="sticky bottom-0 bg-background pt-4 pb-2 border-t flex justify-between items-center">
              <div className="flex gap-2">
                <Button
                  onClick={handleAddFaq}
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Create new FAQ
                </Button>
                <Button
                  variant="outline"
                  onClick={generateFaqs}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate FAQs
                    </>
                  )}
                </Button>
              </div>
              <Button 
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : 'Save'}
              </Button>
            </div>
            <div ref={bottomRef} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Helper function to get color class based on score
function getScoreColorClass(score: number): string {
  if (score >= 80) return 'bg-emerald-400'
  if (score >= 60) return 'bg-green-300'
  if (score >= 40) return 'bg-amber-200'
  if (score >= 20) return 'bg-orange-200'
  return 'bg-red-300'
}