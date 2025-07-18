// app/api/admin/users/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, type AuthenticatedApiHandler } from '@/lib/auth-handler';
import { z } from 'zod';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const userQuerySchema = z.object({
  role: z.nativeEnum(Role).optional(),
  approved: z.enum(['true','false']).optional().transform(v=>v==='true'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

const getUsers: AuthenticatedApiHandler = async (req, _ctx, session) => {
  if (session.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }
  try {
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const parsed = userQuerySchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid query parameters',
        details: parsed.error.flatten(),
      }, { status: 400 });
    }

    const { role, approved, page, limit } = parsed.data;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (role) where.role = role;
    if (approved !== undefined) where.approved = approved;

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      users,
      meta: { total, page, limit, totalPages: Math.ceil(total/limit) },
    });
  } catch (err) {
    console.error('🔥 GET /api/admin/users Error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
};

export const GET = withAuth(getUsers);

// Handler สำหรับสร้างผู้ใช้ใหม่ (Admin)
const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(Role),
  approved: z.boolean().default(false),
});

const createUser: AuthenticatedApiHandler = async (req, _ctx, session) => {
  if (session.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }
  try {
    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid data', details: parsed.error.flatten() }, { status: 400 });
    }
    const { name, email, password, role, approved } = parsed.data;
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hashed, role, approved } });
    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (err) {
    console.error('🔥 POST /api/admin/users Error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
};

export const POST = withAuth(createUser);