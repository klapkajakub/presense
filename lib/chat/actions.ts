import { Action } from '@/types/action';

// Define all available actions that the AI can use
export const availableActions: Action[] = [
  {
    id: 'open-description',
    name: 'Open Description Editor',
    description: 'Opens the business description editor modal',
    parameters: []
  },
  {
    id: 'open-business-hours',
    name: 'Open Business Hours Editor',
    description: 'Opens the business hours editor modal',
    parameters: []
  },
  {
    id: 'save-description',
    name: 'Save Description',
    description: 'Saves a business description for a specific platform',
    parameters: [
      {
        name: 'platform',
        type: 'string',
        description: 'The platform to save the description for (e.g., "gmb", "fb", "ig")',
        required: true
      },
      {
        name: 'content',
        type: 'string',
        description: 'The description content to save',
        required: true
      }
    ]
  },
  {
    id: 'search-web',
    name: 'Search Web',
    description: 'Performs a web search for information',
    parameters: [
      {
        name: 'query',
        type: 'string',
        description: 'The search query',
        required: true
      }
    ]
  },
  {
    id: 'generate-image',
    name: 'Generate Image',
    description: 'Generates an image based on a text prompt',
    parameters: [
      {
        name: 'prompt',
        type: 'string',
        description: 'The text prompt to generate an image from',
        required: true
      },
      {
        name: 'style',
        type: 'string',
        description: 'The style of the image (e.g., "realistic", "cartoon", "abstract")',
        required: false
      }
    ]
  }
];

// Helper function to find an action by ID
export function getActionById(id: string): Action | undefined {
  return availableActions.find(action => action.id === id);
}