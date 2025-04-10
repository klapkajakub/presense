"use client"

import { useEffect } from "react"
import { useModal } from "@/components/modals/modal-context"
import { BusinessHoursWidget } from "./business-hours-widget"

export function BusinessHoursModal() {
  const { closeModal } = useModal()
  
  useEffect(() => {
    console.log('BusinessHoursModal rendered')
  }, [])

  return (
    <div className="p-6">
      <BusinessHoursWidget />
    </div>
  )
} 