"use client"

import React, { createContext, useContext, useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { ModalContents } from './modal-registry';
import { ModalId } from './modal-types';
import type { ModalContentProps } from './types';

interface ModalContextType {
        openModal: (modalId: ModalId, data?: Record<string, any>) => void;
        closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
        const [activeModal, setActiveModal] = useState<ModalId | null>(null);
        const [modalData, setModalData] = useState<Record<string, any> | undefined>(undefined);

        const openModal = (modalId: ModalId, data?: Record<string, any>) => {
                setActiveModal(modalId);
                setModalData(data);
        };

        const closeModal = () => {
                setActiveModal(null);
                setModalData(undefined);
        };

        const renderModalContent = () => {
                if (!activeModal) return null;

                const { Component } = ModalContents[activeModal];
                return <Component data={modalData} onClose={closeModal} />;
        };

        return (
                <ModalContext.Provider value={{ openModal, closeModal }}>
                        {children}
                        {activeModal && (
                                <Modal
                                        isOpen={true}
                                        onClose={closeModal}
                                        title={ModalContents[activeModal].title}
                                >
                                        {renderModalContent()} {/* Remove the duplicate call */}
                                </Modal>
                        )}
                </ModalContext.Provider>
        );
}

export function useModal() {
        const context = useContext(ModalContext);
        if (!context) {
                throw new Error('useModal must be used within a ModalProvider');
        }
        return context;
}