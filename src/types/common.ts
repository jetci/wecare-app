// Placeholder common types for replacing any

export type UnknownObject = Record<string, unknown>;

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export type WithId<T> = T & { id: string };

// Common placeholder types: no re-export needed when using export directly
