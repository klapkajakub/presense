import { ReactNode } from 'react';

export interface ModalContentProps {
        data?: Record<string, any>;
        onClose: () => void;
}

export interface ModalConfig {
        title: string;
        description?: string;  // Make it optional
        Component: React.ComponentType<ModalContentProps>;
}

export type ModalRegistry = Record<string, ModalConfig>;