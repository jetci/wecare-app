import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { PrismaClient } from '@prisma/client';

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
    // Only COMMUNITY members or DEVELOPER (superuser) can list requests
    if (!(role === 'COMMUNITY' || role === 'DEVELOPER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const whereClause = role === 'COMMUNITY' ? { nationalId: userId } : undefined;

    const total = await prisma.requestUser.count({
      ...(whereClause ? { where: whereClause } : {}),
    });

    const totalPages = Math.ceil(total / limit) || 1;

    const requests = await prisma.requestUser.findMany({
      ...(whereClause ? { where: whereClause } : {}),
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: requests, meta: { total, page, limit, totalPages } });
  } catch (e: any) {
    const status = e.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: e.message }, { status });
  }
}
