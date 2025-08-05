import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { LoginSchema } from '@/schemas/login.schema';
import prisma from '@/lib/prisma';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = LoginSchema.safeParse(body);

    if (!validated.success) {
      const errorResponse = { success: false, message: 'ข้อมูลไม่ถูกต้อง', errors: validated.error.flatten().fieldErrors };
      console.log("Login API Response:", errorResponse);
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const { nationalId, password } = validated.data;

    const user = await prisma.user.findUnique({
      where: { nationalId },
    });

    if (!user) {
      const errorResponse = { success: false, message: 'ไม่พบผู้ใช้งานนี้' };
      console.log("Login API Response:", errorResponse);
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const errorResponse = { success: false, message: 'รหัสผ่านไม่ถูกต้อง' };
      console.log("Login API Response:", errorResponse);
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const accessToken = await new SignJWT({ 
        userId: user.id,
        nationalId: user.nationalId,
        role: user.role 
      })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    const successResponse = {
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      token: accessToken,
      user: {
        id: user.id,
        nationalId: user.nationalId,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };

    console.log("✅ Login API Response (Command X Verification):", successResponse);

    // Use NextResponse.json for a robust JSON response, then set the cookie.
    const response = NextResponse.json(successResponse);
    const cookie = `token=${accessToken}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${60 * 60 * 24 * 7}; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`;
    response.headers.set('Set-Cookie', cookie);

    return response;

  } catch (error) {
    console.error('[Login API Error]', error);
    const errorResponse = { success: false, message: 'เกิดข้อผิดพลาดไม่คาดคิด' };
    console.log("Login API Response:", errorResponse);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
