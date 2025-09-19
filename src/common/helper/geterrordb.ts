import { AxiosError } from 'axios';

export const getAxiosErrorMessage = (
  error: any,
  fallbackMessage = 'Ocurrió un error inesperado',
): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data;
    
    
    // Si `details` es string o array
    if (typeof data?.details === 'string') {
      return data.details;
    }
    if (Array.isArray(data?.details)) {
      return data.details.join('\n');
    }
    
    if (data.message) {
      return data.message.toString();
    }
    if (Array.isArray(data?.message)) {
      return data.message.join('\n');
    }

    // Si `error` está en data
    if (typeof data?.error === 'string') {
      return data.error;
    }
  }

  return error.toString() || fallbackMessage;
};
