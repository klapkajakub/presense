"use client"

import { createContext, useContext, useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { BusinessDescriptionModal } from "@/components/business/business-description-modal"

export type ModalType = "business-description"

interface ModalContextType {
  openModal: (type: ModalType) => void
  closeModal: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [modalType, setModalType] = useState<ModalType | null>(null)

  const openModal = (type: ModalType) => {
    setModalType(type)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setModalType(null)
  }

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          {modalType === "business-description" && <BusinessDescriptionModal />}
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