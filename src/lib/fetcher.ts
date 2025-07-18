// Generic fetcher with strict typing
export const fetcher = async ([url, token]: [string, string | null]) => {
  if (!token) throw new Error('No token provided');
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const info = await res.json();
    const error = new Error('Error fetching');
    (error as any).info = info;
    (error as any).status = res.status;
    throw error;
  }
  return res.json();
};
