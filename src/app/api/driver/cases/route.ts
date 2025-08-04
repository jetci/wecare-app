import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { jwtVerify } from 'jose';
import { PrismaClient } from '@prisma/client';
import {
  GetDriverCasesResponseSchema,
  DriverCaseSchema,
  ModifyDriverCaseParamsSchema,
  ModifyDriverCaseResponseSchema,
} from '@/schemas/driver.schema';

const prisma = new PrismaClient();

async function verifyToken(request: NextRequest) {
  const auth = request.headers.get('authorization') || '';
  let token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) token = request.cookies.get('accessToken')?.value || '';
  if (!token) throw new Error('Unauthorized');
  const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!));
  const userJwt = payload as any;
  if (!userJwt.userId) throw new Error('Invalid token');
  return { userId: userJwt.userId, role: (userJwt.role as string).toUpperCase() };
}

export async function GET(request: NextRequest) {
  try {
    const { userId, role } = await verifyToken(request);
    if (!(role === 'DRIVER' || role === 'DEVELOPER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const rides = await prisma.ride.findMany({
      where: { driverId: userId },
      include: { patient: true },
    });
    const cases = rides.map((r) => ({
      id: r.id,
      driverId: r.driverId,
      status: r.status,
      timestamp: r.createdAt.toISOString(),
      location: r.patient.pickupLocation_lat !== undefined ? {
        lat: r.patient.pickupLocation_lat,
        lng: r.patient.pickupLocation_lng,
      } : null,
    }));
    return NextResponse.json(GetDriverCasesResponseSchema.parse(cases));
  } catch (e: any) {
    const status = e.message === 'Unauthorized' ? 401 : e.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: e.message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, role } = await verifyToken(request);
    if (!(role === 'DRIVER' || role === 'DEVELOPER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const body = await request.json();
    const { id, action } = ModifyDriverCaseParamsSchema.extend({ action: z.enum(['accept', 'complete']) }).parse(body);
    let updated;
    if (action === 'accept') {
      updated = await prisma.ride.update({
        where: { id },
        data: { status: 'ACCEPTED', driverId: userId },
      });
    } else {
      updated = await prisma.ride.update({
        where: { id },
        data: { status: 'COMPLETED' },
      });
    }
    return NextResponse.json(ModifyDriverCaseResponseSchema.parse(updated));
  } catch (e: any) {
    const status = e.message === 'Unauthorized' ? 401 : e.message === 'Forbidden' ? 403 : 400;
    return NextResponse.json({ error: e.message }, { status });
  }
}
