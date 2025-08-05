import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { nationalId, password } = await request.json();
  console.log('[API /api/login] Received:', { nationalId, password });
  

  // Mock ตรวจสอบรหัสประชาชนและรหัสผ่าน
  if (nationalId === '3500200461028' && password === '@Admin123') {
    const response = NextResponse.json(
      { accessToken: 'mock-token', refreshToken: 'mock-token', user: { nationalId, role: 'COMMUNITY' } },
      { status: 200 }
    );
    response.cookies.set('refreshToken', 'mock-token', {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
    });
    return response;
  }

  return NextResponse.json(
      { error: 'รหัสประชาชนหรือรหัสผ่านไม่ถูกต้อง' },
      { status: 401 }
    );
}
