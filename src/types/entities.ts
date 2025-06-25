// Shared entity types/interfaces

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  phone: string;
  address?: Address;
  avatarUrl?: string;
}

export interface Address {
  houseNumber: string;
  village: string;
  subdistrict: string;
  district: string;
  province: string;
}

export interface Patient extends User {
  prefix: string;
  bloodGroup: string;
  dob: string; // ISO date string
  age: number;
  photoUrl?: string;
  patientGroup: string;
  otherGroup?: string;
  statusHelpSelf: boolean;
  statusCannotHelpSelf: boolean;
  needTool: boolean;
  toolRemark?: string;
  remark?: string;
  docUrls?: DocUrls;
  latitude: string;
  longitude: string;
  locationLabel?: string;
}

export interface DocUrls {
  docCertHead?: string;
  docCertBed?: string;
  docAppointment?: string;
  docOther?: string;
}

export interface Ride {
  id: string;
  patientId: string;
  date: string; // ISO datetime
  notes?: string;
  status: string;
}

export interface Notification {
  id: string;
  message: string;
  createdAt: string; // ISO datetime
  read: boolean;
}
