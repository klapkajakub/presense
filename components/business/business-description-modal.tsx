"use client"

import { useModal } from "@/components/modals/modal-context"
import { BusinessDescriptionWidget } from "./business-description-widget"

export function BusinessDescriptionModal() {
  const { closeModal } = useModal()

  return (
    <div className="p-6">
      <BusinessDescriptionWidget onClose={closeModal} />
    </div>
  )
} 