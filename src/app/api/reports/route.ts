import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import type { UnknownObject } from '@/types/common';
const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Map frontend types to backend report types
  const rawType = searchParams?.get('type') ?? '';
  const type = rawType === 'PatientSummary' ? 'USER'
    : rawType === 'RideActivity' ? 'RIDE'
    : rawType;
  const from = searchParams?.get('from') ?? null;
  const to = searchParams?.get('to') ?? null;
  let data: UnknownObject[] = [];
  const where: UnknownObject = {};
  if (from) where.createdAt = { gte: new Date(from) };
  if (to) where.createdAt = { ...(where.createdAt || {}), lte: new Date(to) };
  switch (type) {
    case 'RIDE':
      data = await prisma.ride.findMany({ where });
      break;
    case 'USER':
      data = await prisma.user.findMany({ where });
      break;
    default:
      return NextResponse.json({ success: false, code: 'INVALID_TYPE', message: 'Invalid report type' }, { status: 400 });
  }
  return NextResponse.json({ success: true, data });
}
