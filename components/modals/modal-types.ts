import { ComponentType } from 'react';

export type ModalId = 'update-description';

export type ModalContentProps = {
        onClose: () => void;
};

export type ModalRegistry = {
        [key in ModalId]: {
                title: string;
                Component: ComponentType<ModalContentProps>;
        };
};