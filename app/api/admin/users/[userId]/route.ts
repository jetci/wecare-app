// app/api/admin/users/[userId]/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, type AuthenticatedApiHandler } from '@/lib/auth-handler';
import { z } from 'zod';
import { Role } from '@prisma/client';

// Schema สำหรับตรวจสอบข้อมูลที่จะอัปเดต
const updateUserSchema = z.object({
  role: z.nativeEnum(Role).optional(),
  approved: z.boolean().optional(),
});

const updateUser: AuthenticatedApiHandler = async (req, _ctx, session) => {
  if (session.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    // ดึง userId จากพาธ
    const segments = req.nextUrl.pathname.split('/');
    const userId = segments[segments.length - 1];
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid data', details: parsed.error.flatten() }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (parsed.data.role !== undefined) dataToUpdate.role = parsed.data.role;
    if (parsed.data.approved !== undefined) dataToUpdate.approved = parsed.data.approved;

    const user = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error('🔥 PUT /api/admin/users/[userId] Error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
};

export const PUT = withAuth(updateUser);
