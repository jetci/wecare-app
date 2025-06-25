// Shared component and API types
export type UnknownObject = Record<string, unknown>;

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface LogEntry {
  timestamp: string;
  user: string;
  action: string;
  ip: string;
}

export interface ApiKey {
  id: string;
  key: string;
}

export interface ConfirmInfo {
  message: string;
  onConfirm: () => void;
}

export interface LeaderboardItem {
  firstName: string;
  lastName: string;
  completed: number;
  rating: number;
}

export interface RideRequest {
  id: string;
  date: string;
  patient: {
    firstName: string;
    lastName: string;
  };
}
