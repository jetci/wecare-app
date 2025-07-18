import { NextRequest, NextResponse } from 'next/server'; // [FIX] รวม import ไว้ในบรรทัดเดียว
import { jwtVerify } from 'jose';

// Interface สำหรับข้อมูลที่ถอดรหัสได้จาก Token
export interface AuthSession {
  userId: string;
  role: 'ADMIN' | 'COMMUNITY' | 'DRIVER' | 'OFFICER' | 'EXECUTIVE' | 'DEVELOPER';
  // เพิ่ม field อื่นๆ ตามที่จำเป็น
}

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT Secret key is not set in environment variables!');
  }
  return new TextEncoder().encode(secret);
};

/**
 * Verifies the JWT token from the request headers and returns the session payload.
 * @param req The NextRequest object.
 * @returns A promise that resolves to the AuthSession payload or NextResponse if invalid.
 */
export async function verifyAuth(req: NextRequest): Promise<AuthSession | NextResponse> {
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ success: false, code: 'MISSING_TOKEN', message: 'Missing token' }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    return payload as AuthSession;
  } catch (error) {
    return NextResponse.json({ success: false, code: 'INVALID_TOKEN', message: 'Invalid token' }, { status: 401 });
  }
}
