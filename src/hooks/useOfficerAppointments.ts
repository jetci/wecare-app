import { useState, useEffect } from 'react';

export interface OfficerAppointment {
  id: string;
  area: string;
  status: string;
  date: string;
  [key: string]: any;
}

export function useOfficerAppointments() {
  const [data, setData] = useState<OfficerAppointment[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/officer/appointments')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { data, error, isLoading };
}
