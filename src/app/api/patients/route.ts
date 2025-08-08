import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { type AuthSession } from '@/types/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!('session' in authResult)) {
      return authResult; // Returns NextResponse on auth failure
    }
    const { session } = authResult;
    const { userId, role } = session as AuthSession;

    if (!(role === 'COMMUNITY' || role === 'DEVELOPER')) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (role === 'COMMUNITY') {
      where.managedByUserId = userId;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { nationalId: { contains: search } },
      ];
    }

    const [total, patients] = await prisma.$transaction([
      prisma.patient.count({ where }),
      prisma.patient.findMany({
        where,
        skip,
        take: limit,
        include: {
          managedByUser: {
            select: { firstName: true, lastName: true },
          },
        },
      }),
    ]);

    return NextResponse.json({ patients, total, page, limit });
  } catch (error) {
    console.error('[API/patients GET] Unhandled Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!('session' in authResult)) {
      return authResult; // Returns NextResponse on auth failure
    }
    const { session } = authResult;
    const { userId, role } = session as AuthSession;

    if (!(role === 'COMMUNITY' || role === 'DEVELOPER')) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const data = await request.json();

    // Basic validation could be added here with Zod if needed

    const newPatient = await prisma.patient.create({
      data: { ...data, managedByUserId: userId },
    });

    return NextResponse.json(newPatient, { status: 201 });
  } catch (error) {
    console.error('[API/patients POST] Unhandled Error:', error);
    // Check for Prisma validation errors
    if (error instanceof Error && error.name.includes('Prisma')) {
      return NextResponse.json({ message: 'Invalid data provided' }, { status: 400 });
    }

    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
