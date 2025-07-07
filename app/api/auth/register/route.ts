
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

import { Role } from '@/types/roles';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Input validation schema using Zod
const registerSchema = z.object({
  prefix: z.string().min(2),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  nationalId: z.string().regex(/^\d{13}$/, 'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก'),
  password: z.string().min(8),
  phone: z.string().min(10, 'เบอร์โทรศัพท์ต้องอย่างน้อย 10 หลัก').regex(/^\d+$/, 'เบอร์โทรศัพท์ต้องเป็นตัวเลขเท่านั้น'),
  role: z.enum(['DRIVER','HEALTH_OFFICER','COMMUNITY','EXECUTIVE','ADMIN'], { errorMap: () => ({ message: 'กรุณาเลือกบทบาท' }) }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
    }
    const { prefix, firstName, lastName, nationalId, password, phone, role } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { nationalId } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'nationalId exists' }, { status: 409 });
    }
    // Hash password and create user
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: {
      prefix,
      firstName,
      lastName,
      nationalId,
      phone,
      password: hashed,
      role,
      position: role,
      approved: false,
    }});
    // Omit password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pwd, ...userSafe } = user;
    return NextResponse.json({ success: true, user: userSafe });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal Server Error' }, { status: 500 });
  }
}
