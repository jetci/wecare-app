import { useState, useEffect } from 'react';

export interface OfficerPatient {
  id: string;
  area: string;
  [key: string]: any;
}

export function useOfficerPatients() {
  const [data, setData] = useState<OfficerPatient[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/officer/patients')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { data, error, isLoading };
}
