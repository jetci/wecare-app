// API data types

/** User profile returned from /api/auth/profile */
export interface ApiProfile {
  nationalId: string;
  id: string;
  name: string;
  role: string;
}

/** Ride record */
export interface Ride {
  id: string;
  date: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  driverName?: string;
  rating?: number;
}

/** Patient record */
export interface Patient {
  id: string;
  name: string;
  dob: string;
  address: string;
}

import { Role } from './roles';
/** User request for admin approval */
export interface RequestUser {
  id: string;
  prefix: string;
  firstName: string;
  lastName: string;
  role: Role;
}
