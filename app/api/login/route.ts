import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  console.log('[API /api/login] Received:', body);
  const { citizenId, password } = body;

  // Mock ตรวจสอบรหัสประชาชนและรหัสผ่าน
  if (citizenId === '3500200461028' && password === '@Admin123') {
    const response = new NextResponse(
      JSON.stringify({ success: true, role: 'DEVELOPER' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    response.cookies.set('auth', 'mock', {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
    });
    return response;
  }

  return new NextResponse(
    JSON.stringify({ message: 'รหัสประชาชนหรือรหัสผ่านไม่ถูกต้อง' }),
    {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
