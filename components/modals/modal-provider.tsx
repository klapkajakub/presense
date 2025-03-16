"use client"

import { createContext, useContext, useState } from "react"

type ModalType = "update-description" | "settings"

interface ModalContextType {
  isOpen: boolean
  type: ModalType | null
  openModal: (type: ModalType) => void
  closeModal: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState<ModalType | null>(null)

  const openModal = (modalType: ModalType) => {
    setType(modalType)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setType(null)
  }

  return (
    <ModalContext.Provider value={{ isOpen, type, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error("useModal must be used within ModalProvider")
  }
  return context
}