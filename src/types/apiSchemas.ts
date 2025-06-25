export interface UploadFileResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  status: 'active' | 'recovered' | 'transferred';
}

export interface GetPatientsResponse {
  data: Patient[];
  page: number;
  totalPages: number;
}

export interface Ride {
  id: string;
  patientId: string;
  datetime: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
}

export interface GetRidesResponse {
  data: Ride[];
}

export interface RideRequest {
  patientId: string;
  datetime: string;
}
