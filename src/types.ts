// Common type definitions

/** Notification item */
export interface Notification {
  id: string;
  message: string;
}

/** Data point for reports chart */
export interface ReportData {
  name: string;
  value: number;
}

/** User request for admin approval */
export interface UserRequest {
  id: string;
  username: string;
  email: string;
  approved: boolean;
}
