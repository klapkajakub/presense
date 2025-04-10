"use client"

import { useEffect } from "react"
import { useModal } from "@/components/modals/modal-context"
import { BusinessDescriptionWidget } from "./business-description-widget"

export function BusinessDescriptionModal() {
  const { closeModal } = useModal()
  
  useEffect(() => {
    console.log('BusinessDescriptionModal rendered')
  }, [])

  return (
    <div className="p-6">
      <BusinessDescriptionWidget onClose={closeModal} />
    </div>
  )
}