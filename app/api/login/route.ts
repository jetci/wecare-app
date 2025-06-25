import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  console.log('[API /api/login] Received:', body);
  const { citizenId, password } = body;

  // ตัวอย่างตรวจสอบรหัสประชาชนและรหัสผ่าน
  if (citizenId === '3500200461028' && password === '@Admin123') {
    const res = NextResponse.json({ success: true });
    res.cookies.set('auth', 'mock', { httpOnly: true, path: '/' });
    return res;
  }
  return NextResponse.json(
    { message: 'รหัสประชาชนหรือรหัสผ่านไม่ถูกต้อง' },
    { status: 401 }
  );
}
