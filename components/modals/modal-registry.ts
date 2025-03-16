import { ModalId, ModalRegistry } from './modal-types';
import UpdateDescriptionModal from './update-description-modal';

export const ModalContents: ModalRegistry = {
    'update-description': {
        title: 'Update Descriptions',
        Component: UpdateDescriptionModal
    }
} as const;

export function getModalContent(modalId: ModalId) {
    const content = ModalContents[modalId];
    if (!content) {
        throw new Error(`Modal with id "${modalId}" not found`);
    }
    return content;
}