import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  const { nationalId, password } = await request.json();
  console.log('[API /api/login] Received:', { nationalId, password });

  // Mock ตรวจสอบรหัสประชาชนและรหัสผ่าน
  if (nationalId === '3500200461028' && password === '@Admin123') {
    const payload = { userId: nationalId, role: 'ADMIN' };
    // สร้าง JWT ด้วย secret และอายุ 7 วัน
    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' });
    const response = NextResponse.json(
      { accessToken: token, refreshToken: token, user: { nationalId, role: 'ADMIN' } },
      { status: 200 }
    );
    response.cookies.set('refreshToken', token, {
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
