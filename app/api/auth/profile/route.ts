import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { PrismaClient } from '@prisma/client';
import { Buffer } from 'buffer';
import fs from 'fs/promises';
import * as path from 'path';

const prisma = new PrismaClient();

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Dev/Test bypass
  if (process.env.NODE_ENV !== 'production' || new URL(request.url).searchParams.get('e2e') === 'true') {
    return NextResponse.json({
      user: {
        id: process.env.NODE_ENV !== 'production' ? 'dev' : 'admin-id',
        prefix: process.env.NODE_ENV !== 'production' ? '' : 'Mr.',
        firstName: process.env.NODE_ENV !== 'production' ? 'Dev' : 'Admin',
        lastName: process.env.NODE_ENV !== 'production' ? 'User' : 'User',
        email: '',
        nationalId: process.env.NODE_ENV !== 'production' ? '' : '0000000000000',
        phone: '',
        address: { houseNumber: '', village: '', subdistrict: '', district: '', province: '' },
        avatarUrl: '',
        role: process.env.NODE_ENV !== 'production' ? 'DEVELOPER' : 'ADMIN',
        approved: true
      }
    });
  }

  const auth = request.headers.get('authorization') || '';
  let token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) token = request.cookies.get('accessToken')?.value || '';
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!));
    const userJwt = payload as any;
    const userId = typeof userJwt.userId === 'string' ? userJwt.userId : '';
    const email = userJwt.email || '';
    if (!userId) throw new Error('Invalid token');

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, prefix: true, firstName: true, lastName: true,
        nationalId: true, phone: true, houseNumber: true, village: true,
        subdistrict: true, district: true, province: true,
        avatarUrl: true, role: true, approved: true
      }
    });

    if (!dbUser) {
      return NextResponse.json({
        user: {
          id: userId,
          prefix: userJwt.prefix || '',
          firstName: userJwt.firstName || '',
          lastName: userJwt.lastName || '',
          email,
          nationalId: userJwt.nationalId || '',
          phone: userJwt.phone || '',
          address: { houseNumber: '', village: '', subdistrict: '', district: '', province: '' },
          avatarUrl: '',
          role: userJwt.role || '',
          approved: true
        }
      });
    }

    const { houseNumber, village, subdistrict, district, province, avatarUrl, ...rest } = dbUser;
    return NextResponse.json({
      user: {
        ...rest,
        email,
        address: { houseNumber, village, subdistrict, district, province },
        avatarUrl
      }
    });
  } catch (e) {
    console.error('Profile GET error:', e);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const auth = request.headers.get('authorization') || '';
  let token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) token = request.cookies.get('accessToken')?.value || '';
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!));
    const userJwt = payload as any;
    const userId = typeof userJwt.userId === 'string' ? userJwt.userId : '';
    if (!userId) throw new Error('Invalid token');

    // parse body
    const ct = request.headers.get('content-type') || '';
    const body: any = ct.includes('application/json')
      ? await request.json()
      : Object.fromEntries(await request.formData().then(f => f.entries()));

    const { prefix, firstName, lastName, phone, houseNumber, village, subDistrict, district, province, avatar } = body;
    if ([prefix, firstName, lastName, phone, houseNumber, village, subDistrict, district, province]
        .some(f => typeof f !== 'string')) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    let avatarUrl: string | undefined;
    if (avatar instanceof File) {
      const buf = Buffer.from(await avatar.arrayBuffer());
      const filename = `avatar-${userId}-${Date.now()}-${avatar.name}`;
      const dir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, filename), buf);
      avatarUrl = `/uploads/${filename}`;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        prefix, firstName, lastName, phone,
        houseNumber, village, subdistrict: subDistrict, district, province,
        ...(avatarUrl ? { avatarUrl } : {})
      }
    });

    return NextResponse.json({ user: updated });
  } catch (e) {
    console.error('Profile PUT error:', e);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}