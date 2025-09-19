// Error handling utilities

export interface AppError {
  message: string;
  type: 'network' | 'location' | 'api' | 'permission' | 'unknown';
  retryable: boolean;
}

export function createAppError(error: unknown, context: string): AppError {
  console.error(`Error in ${context}:`, error);

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Network errors
    if (message.includes('fetch') || message.includes('network') || message.includes('failed to fetch')) {
      return {
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        type: 'network',
        retryable: true
      };
    }
    
    // Location errors
    if (message.includes('location') || message.includes('geolocation')) {
      if (message.includes('permission')) {
        return {
          message: 'Location access was denied. Please enable location permissions or search for a location manually.',
          type: 'permission',
          retryable: false
        };
      }
      return {
        message: 'Unable to determine your location. Please search for a location manually.',
        type: 'location',
        retryable: true
      };
    }
    
    // API errors
    if (message.includes('api') || message.includes('server') || message.includes('status')) {
      return {
        message: 'Unable to fetch Shabbat times. Please try again in a moment.',
        type: 'api',
        retryable: true
      };
    }
    
    // Generic error
    return {
      message: error.message || 'An unexpected error occurred. Please try again.',
      type: 'unknown',
      retryable: true
    };
  }
  
  return {
    message: 'An unexpected error occurred. Please try again.',
    type: 'unknown',
    retryable: true
  };
}

export function getErrorMessage(error: AppError): string {
  return error.message;
}

export function canRetry(error: AppError): boolean {
  return error.retryable;
}
