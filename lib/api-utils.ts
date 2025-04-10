/**
 * API utilities for consistent error handling and response formatting
 */

// Standard API response format
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

/**
 * Wrapper for fetch that handles errors consistently
 */
export async function apiRequest<T = any>(
  url: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'API request failed',
        message: data.message || `Error ${response.status}: ${response.statusText}`,
        statusCode: response.status,
      };
    }

    return {
      success: true,
      data: data,
      statusCode: response.status,
    };
  } catch (error) {
    console.error('API request error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to complete API request',
      statusCode: 500,
    };
  }
}

/**
 * Helper to handle API errors consistently in components
 */
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (typeof error === 'object' && error !== null) {
    // @ts-ignore
    if (error.message) {
      // @ts-ignore
      return error.message;
    }
  }
  
  return 'An unknown error occurred';
}

/**
 * Format date for API consumption
 */
export function formatDateForApi(date: Date): string {
  return date.toISOString();
}

/**
 * Parse date from API
 */
export function parseDateFromApi(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Safely parse JSON
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.error('JSON parse error:', error);
    return fallback;
  }
} 