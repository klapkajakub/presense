"use client"

import { createContext, useContext, useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { BusinessDescriptionModal } from "@/components/business/business-description-modal"
import { BusinessHoursModal } from "@/components/business/business-hours-modal"

export type ModalType = "business-description" | "business-hours"

interface ModalContextType {
  openModal: (type: ModalType) => void
  closeModal: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [modalType, setModalType] = useState<ModalType | null>(null)

  const openModal = (type: ModalType) => {
    console.log('Modal opening requested:', type);
    setModalType(type);
    setIsOpen(true);
    console.log('Modal state updated - type:', type, 'isOpen:', true);
  }

  const closeModal = () => {
    console.log('Modal closing requested');
    setIsOpen(false);
    setModalType(null);
    console.log('Modal state updated - isOpen:', false, 'type: null');
  }

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          {modalType === "business-description" && <BusinessDescriptionModal />}
          {modalType === "business-hours" && <BusinessHoursModal />}
        </DialogContent>
      </Dialog>
    </ModalContext.Provider>
  )
}

export function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider")
  }
  return context
}