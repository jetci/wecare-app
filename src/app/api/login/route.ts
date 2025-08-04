import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { LoginSchema } from '../../../schemas/login.schema';
import prisma from '../../../lib/prisma';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = LoginSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { message: 'ข้อมูลไม่ถูกต้อง', errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { nationalId, password } = validated.data;

    const user = await prisma.user.findUnique({
      where: { nationalId },

    });

    if (!user) {
      return NextResponse.json({ message: 'ไม่พบผู้ใช้งานนี้' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'รหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    const token = await new SignJWT({ 
        userId: user.id,
        nationalId: user.nationalId,
        role: user.role 
      })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    const response = NextResponse.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        id: user.id,
        nationalId: user.nationalId,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });

    return response;

  } catch (error) {
    console.error('[Login API Error]', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดไม่คาดคิด' }, { status: 500 });
  }
}
