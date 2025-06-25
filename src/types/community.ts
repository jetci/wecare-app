export interface Community {
  id: string;
  name: string;
  total: number;
  inCare: number;
  transferred: number;
}

export interface Ride {
  id: string;
  patientId: string;
  date: string; // ISO date string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  origin?: string;
  description?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string; // ISO date string
  read?: boolean;
}

export interface HealthPoint {
  id: string;
  name: string;
  value: number;
  unit?: string;
}
