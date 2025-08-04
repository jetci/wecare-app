import { NextResponse } from 'next/server';
import { LoginSchema } from '@/schemas/login.schema';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedFields = LoginSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
    }

    const { nationalId, password } = validatedFields.data;

    const user = await prisma.user.findUnique({
      where: {
        nationalId,
      },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: 'รหัสประชาชนหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return NextResponse.json({ error: 'รหัสประชาชนหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const alg = 'HS256';

    const token = await new jose.SignJWT({
        userId: user.id,
        nationalId: user.nationalId,
        role: user.role,
      })
      .setProtectedHeader({ alg })
      .setExpirationTime('1d')
      .setIssuedAt()
      .sign(secret);

    const response = NextResponse.json({ success: 'เข้าสู่ระบบสำเร็จ' }, { status: 200 });
    
    response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
    });

    return response;

  } catch (error) {
    console.error('[LOGIN_API_ERROR]', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' }, { status: 500 });
  }
}
