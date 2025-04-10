export interface ActionParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required?: boolean;
}

export interface Action {
  id: string;
  name: string;
  description: string;
  parameters: ActionParameter[];
}

export interface ActionCall {
  actionId: string;
  parameters: Record<string, any>;
  status: 'pending' | 'success' | 'error';
  result?: any;
  error?: string;
}

export interface ActionResponse {
  success: boolean;
  result?: any;
  error?: string;
}