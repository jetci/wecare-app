import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { type AuthSession } from '@/types/auth';
import prisma from '@/lib/prisma';



export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!('session' in authResult)) {
      return authResult;
    }
    const { session } = authResult;
    const { userId, role } = session as AuthSession;
    // Only COMMUNITY members or DEVELOPER (superuser) can list patients
    if (!(role === 'COMMUNITY' || role === 'DEVELOPER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    // Parse query params for search and pagination
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Build filter condition
    const where: any = {};
    if (role === 'COMMUNITY') where.managedByUserId = userId;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { nationalId: { contains: search } }
      ];
    }

    // Count and fetch
    const total = await prisma.patient.count({ where });
    const patients = await prisma.patient.findMany({ where, skip, take: limit });
    return NextResponse.json({ patients, total });
  } catch (e: any) {
    const status = e.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: e.message }, { status });
  }
}

// Create new patient (COMMUNITY or DEVELOPER)
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!('session' in authResult)) {
      return authResult;
    }
    const { session } = authResult;
    const { userId, role } = session as AuthSession;
    if (!(role === 'COMMUNITY' || role === 'DEVELOPER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const data = await request.json();
    const newPatient = await prisma.patient.create({ data: { ...data, managedByUserId: userId } });
    return NextResponse.json(newPatient, { status: 201 });
  } catch (e: any) {
    const status = e.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: e.message }, { status });
  }
}
