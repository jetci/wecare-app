import { NextResponse } from 'next/server'
import { PrismaClient, Role, Position, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const prisma = new PrismaClient()

// Validate and require admin JWT
const tokenSchema = z.object({ userId: z.string(), role: z.nativeEnum(Role) });
async function requireAdmin(req: Request): Promise<z.infer<typeof tokenSchema> | NextResponse> {
  const auth = req.headers.get('authorization')
  if (!auth || !auth.startsWith('Bearer '))
    return NextResponse.json({ success: false, error: 'Missing token' }, { status: 401 })
  try {
    const raw = jwt.verify(auth.replace('Bearer ', ''), process.env.JWT_SECRET!);
    const parse = tokenSchema.safeParse(raw);
    if (!parse.success) throw new Error('Invalid token payload');
    const payload = parse.data;
    if (payload.role !== 'ADMIN') throw new Error()
    return payload
  } catch {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }
}

// GET list & POST create user
export async function GET(req: Request) {
  const admin = await requireAdmin(req)
  if (!(admin && typeof admin === 'object')) return admin as NextResponse
  const url = new URL(req.url)
  const role = url.searchParams?.get('role') ?? ''
  const approved = url.searchParams?.get('approved') ?? null
  const where: Prisma.UserWhereInput = {};
  if (role) where.role = role as Role
  if (approved !== null) where.approved = approved === 'true'
  const users = await prisma.user.findMany({ where })
  return NextResponse.json({ success: true, users })
}

export async function POST(req: Request) {
  const admin = await requireAdmin(req)
  if (!(admin && typeof admin === 'object')) return admin as NextResponse
  let parsedBody: unknown;
  try { parsedBody = await req.json(); } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }
  const createSchema = z.object({ firstName: z.string(), lastName: z.string(), nationalId: z.string(), password: z.string(), role: z.nativeEnum(Role), position: z.nativeEnum(Position) });
  const result = createSchema.safeParse(parsedBody);
  if (!result.success) {
    return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
  }
  const { firstName, lastName, nationalId, password, role, position } = result.data;
  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { firstName, lastName, nationalId, password: hashed, role, position, approved: false }
  })
  return NextResponse.json({ success: true, user }, { status: 201 })
}

export async function PUT(req: Request) {
  const admin = await requireAdmin(req)
  if (!(admin && typeof admin === 'object')) return admin as NextResponse
  let parsedBody: unknown;
  try { parsedBody = await req.json(); } catch {
    return NextResponse.json({ success: false, code: 'INVALID_JSON', message: 'Invalid JSON' }, { status: 400 });
  }
  const updateSchema = z.object({ userId: z.string(), approved: z.boolean() });
  const updateResult = updateSchema.safeParse(parsedBody);
  if (!updateResult.success) {
    return NextResponse.json({ success: false, code: 'INVALID_INPUT', message: 'Invalid input' }, { status: 400 });
  }
  const { userId, approved } = updateResult.data;
  try {
    const user = await prisma.user.update({ where: { id: userId }, data: { approved } })
    return NextResponse.json({ success: true, user })
  } catch (error: unknown) {
    console.error('User PUT error:', error);
    return NextResponse.json({ success: false, code: 'UPDATE_FAILED', message: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const admin = await requireAdmin(req)
  if (!(admin && typeof admin === 'object')) return admin as NextResponse
  let parsedBody: unknown;
  try { parsedBody = await req.json(); } catch {
    return NextResponse.json({ success: false, code: 'INVALID_JSON', message: 'Invalid JSON' }, { status: 400 });
  }
  const deleteSchema = z.object({ userId: z.string() });
  const deleteResult = deleteSchema.safeParse(parsedBody);
  if (!deleteResult.success) {
    return NextResponse.json({ success: false, code: 'INVALID_INPUT', message: 'Invalid input' }, { status: 400 });
  }
  const { userId } = deleteResult.data;
  try {
    await prisma.user.delete({ where: { id: userId } })
    return NextResponse.json({ success: true }, { status: 204 })
  } catch (error: unknown) {
    console.error('User DELETE error:', error);
    return NextResponse.json({ success: false, code: 'DELETE_FAILED', message: 'Delete failed' }, { status: 500 })
  }
}
