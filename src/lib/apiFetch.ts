/**
 * A wrapper around the native fetch API to provide a centralized
 * place for handling API requests, setting default headers, and managing errors.
 */
export const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const fullUrl = url;

  // Use the Headers constructor for robust, type-safe header management.
  const requestHeaders = new Headers(options.headers);

  // Set default Content-Type if not already present.
  if (!requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  // Add the Authorization token if it exists (client-side only).
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
      console.log('[apiFetch] Token attached to request header.');
    }
  }

  const config: RequestInit = {
    ...options,
    headers: requestHeaders,
  };

  try {
    const response = await fetch(fullUrl, config);
    return response;
  } catch (error) {
    console.error('API Fetch Error:', error);
    throw new Error('An error occurred while communicating with the server.');
  }
};
