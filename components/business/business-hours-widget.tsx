"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { IconContainer } from "@/components/ui/icon-container"
import { useBusiness } from "./business-context"
import { Clock, Plus, Trash } from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { IBusinessHours } from "@/models/BusinessHours"

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

export function BusinessHoursWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { businessInfo, updateHours } = useBusiness()
  const hours = businessInfo.hours

  useEffect(() => {
    const loadHours = async () => {
      try {
        const response = await fetch('/api/business-hours')
        const data = await response.json()
        
        if (!response.ok) throw new Error(data.error || 'Failed to load business hours')
        
        if (data.success && data.data) {
          updateHours(data.data as IBusinessHours)
        }
      } catch (error) {
        console.error('Error loading hours:', error)
        toast.error('Failed to load business hours')
      } finally {
        setIsLoading(false)
      }
    }

    loadHours()
  }, [updateHours])

  const handleSave = async () => {
    try {
      const response = await fetch('/api/business-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours: businessInfo.hours })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to save business hours')
      
      toast.success('Business hours saved')
      setIsOpen(false)
    } catch (error) {
      console.error('Error saving hours:', error)
      toast.error('Failed to save business hours')
    }
  }

  const updateDaySchedule = (day: typeof DAYS[number], updates: any) => {
    if (!hours) return
    updateHours({
      ...hours,
      regularHours: {
        ...hours.regularHours,
        [day]: {
          ...hours.regularHours[day],
          ...updates
        }
      }
    })
  }

  const addTimeRange = (day: typeof DAYS[number]) => {
    if (!hours) return
    const daySchedule = hours.regularHours[day]
    updateDaySchedule(day, {
      ranges: [...daySchedule.ranges, { open: "09:00", close: "17:00" }]
    })
  }

  const removeTimeRange = (day: typeof DAYS[number], index: number) => {
    if (!hours) return
    const daySchedule = hours.regularHours[day]
    const newRanges = [...daySchedule.ranges]
    newRanges.splice(index, 1)
    updateDaySchedule(day, { ranges: newRanges })
  }

  const updateTimeRange = (day: typeof DAYS[number], index: number, field: 'open' | 'close', value: string) => {
    if (!hours) return
    const daySchedule = hours.regularHours[day]
    const newRanges = [...daySchedule.ranges]
    newRanges[index] = { ...newRanges[index], [field]: value }
    updateDaySchedule(day, { ranges: newRanges })
  }

  const getPreviewText = () => {
    if (!hours) return 'No hours set'
    const weekdayRanges = hours.regularHours.monday.ranges
    if (weekdayRanges.length === 0) return 'Closed'
    const firstRange = weekdayRanges[0]
    return `${firstRange.open} - ${firstRange.close}${weekdayRanges.length > 1 ? ' +more' : ''}`
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconContainer icon={<Clock className="h-5 w-5" />} />
            <div>
              <CardTitle className="text-lg">Business Hours</CardTitle>
              <CardDescription>Loading...</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    )
  }

  return (
    <>
      <Card 
        className="cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setIsOpen(true)}
      >
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconContainer icon={<Clock className="h-5 w-5" />} />
            <div>
              <CardTitle className="text-lg">Business Hours</CardTitle>
              <CardDescription>Set your regular business hours</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Weekdays: {getPreviewText()}
          </p>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Business Hours</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {hours && DAYS.map((day) => (
              <div key={day} className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="capitalize">{day}</Label>
                  <Switch
                    checked={hours.regularHours[day].isOpen}
                    onCheckedChange={(checked) => updateDaySchedule(day, { isOpen: checked })}
                  />
                </div>
                
                {hours.regularHours[day].isOpen && (
                  <div className="space-y-2">
                    {hours.regularHours[day].ranges.map((range, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={range.open}
                          onChange={(e) => updateTimeRange(day, index, 'open', e.target.value)}
                          className="w-32"
                        />
                        <span>-</span>
                        <Input
                          type="time"
                          value={range.close}
                          onChange={(e) => updateTimeRange(day, index, 'close', e.target.value)}
                          className="w-32"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTimeRange(day, index)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addTimeRange(day)}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Hours
                    </Button>
                  </div>
                )}
              </div>
            ))}
            
            <div className="flex justify-end">
              <Button onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 