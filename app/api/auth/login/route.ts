import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  // E2E bypass: return mock admin when cookie or test env
  const cookie = req.headers.get('cookie') || '';
  if (process.env.NODE_ENV === 'test' || cookie.includes('e2e=true')) {
    const payload = { userId: 'e2e-admin', role: 'ADMIN' };
    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' });
    return NextResponse.json({ success: true, user: { id: 'e2e-admin', firstName: 'Admin', role: 'ADMIN' }, accessToken: token, refreshToken: token });
  }

  const { nationalId, password } = await req.json();
  console.log('[Login API] payload:', { nationalId, password });

  const user = await prisma.user.findUnique({ where: { nationalId } });
  console.log('[Login API] user fetched:', user);
  // Dev superuser bypass
  const devId = process.env.NEXT_PUBLIC_DEV_USER_ID;
  const isDev = !!devId && user?.nationalId === devId;
  console.log('[Login API] isDev:', isDev);

  if (!user) {
    console.log('[Login API] user not found');
    return NextResponse.json({ success: false, error: 'รหัสบัตรประชาชนหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
  }
  const match = await bcrypt.compare(password, user.password);
  console.log('[Login API] password match:', match);
  if (!match) {
    return NextResponse.json({ success: false, error: 'รหัสบัตรประชาชนหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
  }

  if (!user.approved && !isDev) {
    return NextResponse.json({ success: false, error: 'บัญชีของคุณยังรอการอนุมัติจากผู้ดูแลระบบ' }, { status: 403 });
  }

  const payload = { userId: user.id, role: isDev ? 'DEVELOPER' : user.role }
  // Access token valid for 7 days to reduce early expiry issues
  const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' })
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' })

  // ส่ง refreshToken ใน HttpOnly cookie
  const response = NextResponse.json(
    { success: true, user: { id: user.id, firstName: user.firstName, role: isDev ? 'DEVELOPER' : user.role }, accessToken: token },
    { status: 200 }
  );
  response.cookies.set('refreshToken', refreshToken, { httpOnly: true, path: '/', maxAge: 7 * 24 * 60 * 60 });
  // Set access token cookie for API auth fallback
  response.cookies.set('accessToken', token, { httpOnly: true, path: '/', maxAge: 7 * 24 * 60 * 60 });
  return response;
}
