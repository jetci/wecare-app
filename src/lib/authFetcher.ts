// src/lib/authFetcher.ts
// SWR fetcher ที่แนบ Bearer token จาก cookie และส่ง credentials
export default async function authFetcher(url: string) {
  // ดึง token จาก cookie
  // First try cookie, then localStorage
  let token = '';
  if (typeof window !== 'undefined') {
    token = document.cookie
      .split('; ')
      .find(c => c.startsWith('accessToken='))
      ?.split('=')[1] || '';
    if (!token) {
      token = localStorage.getItem('accessToken') || '';
    }
  }

  const headers: Record<string,string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, {
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    const err = new Error('Authentication error');
    (err as any).status = res.status;
    throw err;
  }
  return res.json();
}
