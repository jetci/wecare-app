// src/controllers/authController.ts

import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { compare } from 'bcryptjs';
import prisma from '../utils/prisma';
import { signToken } from '../utils/jwt';
import {
  loginRequestSchema,
  loginResponseSchema,
  profileResponseSchema,
  type LoginRequest,
  type LoginResponse,
  type ProfileResponse,
} from '../schemas/authSchemas';

// POST /api/auth/login
export async function loginHandler(req: Request, res: Response) {
  const parsed = loginRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    const msg = parsed.error.errors[0].message;
    return res.status(400).json({ error: msg });
  }

  const { nationalId, password } = parsed.data as LoginRequest;
  const user = await prisma.user.findUnique({ where: { nationalId } });
  if (!user) {
    return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
  }

  const valid = await compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
  }

  const accessToken = signToken({ userId: user.id, role: user.role });
  const response = loginResponseSchema.parse({
    accessToken,
    user: { id: user.id, role: user.role },
  } as LoginResponse);

  // สร้าง refresh token และเก็บใน DB
  const refreshToken = randomUUID();
  const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt: refreshExpires } });
  // ตั้งค่า refreshToken cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: refreshExpires,
  });
  return res.json(response);
}

// GET /api/auth/profile
export async function profileHandler(req: Request, res: Response) {
  // jwtAuth middleware ต้องแปะ req.user ไว้ก่อนแล้ว
  const payload = (req as any).user as { userId: string; role: string };
  if (!payload?.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) {
    return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
  }

  const profile: ProfileResponse = {
    id: user.id,
    nationalId: user.nationalId,
    prefix: user.prefix,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: user.role,
    approved: user.approved,
  };
  const validated = profileResponseSchema.parse(profile);
  return res.json(validated);
}

// POST /api/auth/refresh
export async function refreshHandler(req: Request, res: Response) {
  const token = req.cookies.refreshToken as string | undefined;
  if (!token) return res.status(401).json({ error: 'ต้องเข้าสู่ระบบใหม่' });
  const record = await prisma.refreshToken.findUnique({ where: { token } });
  if (!record || record.expiresAt < new Date()) {
    return res.status(401).json({ error: 'Refresh token ไม่ถูกต้องหรือหมดอายุ' });
  }
  const user = await prisma.user.findUnique({ where: { id: record.userId } });
  if (!user) return res.status(401).json({ error: 'ไม่พบผู้ใช้' });
  // issue new tokens
  const accessToken = signToken({ userId: user.id, role: user.role });
  const newRefresh = randomUUID();
  const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.update({ where: { token }, data: { token: newRefresh, expiresAt: refreshExpires } });
  res.cookie('refreshToken', newRefresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: refreshExpires,
  });
  const response = loginResponseSchema.parse({ accessToken, user: { id: user.id, role: user.role } });
  return res.json(response);
}

// POST /api/auth/logout
export async function logoutHandler(req: Request, res: Response) {
  const token = req.cookies.refreshToken as string | undefined;
  if (token) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  return res.json({ success: true });
}
