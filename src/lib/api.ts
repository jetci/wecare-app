export async function apiFetch(input: RequestInfo, init?: RequestInit) {
  // ดึง token จาก localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  // สร้าง headers และแนบ Authorization ถ้ามี
  const headers = new Headers(init?.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  // ตั้ง Content-Type เป็น JSON ถ้ายังไม่มี
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  // เรียก API
    const response = await fetch(input, { 
    ...init, 
    headers,
    credentials: init?.credentials ?? 'include'
  });
  return response;
}
