import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-handler';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const getCasesQuerySchema = z.object({
  nationalId: z.string(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

const postCaseBodySchema = z.object({
  type: z.string(),
  status: z.string().optional(),
  description: z.string().optional(),
});

const getDriverCases = async (
  req: NextRequest,
  _ctx: any,
  session: any
) => {
  if (session.role !== 'DRIVER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const url = new URL(req.url);
  const parseResult = getCasesQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parseResult.success) {
    return NextResponse.json({ error: 'Invalid query', details: parseResult.error.issues }, { status: 400 });
  }
  const { nationalId, page, limit } = parseResult.data;
  const cases = await prisma.case.findMany({
    where: { nationalId },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ cases });
};

const postDriverAction = async (
  req: NextRequest,
  _ctx: any,
  session: any
) => {
  if (session.role !== 'DRIVER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await req.json();
  const parseResult = postCaseBodySchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json({ error: 'Invalid body', details: parseResult.error.issues }, { status: 400 });
  }
  const { type, status, description } = parseResult.data;
  const driverCase = await prisma.case.create({
    data: {
      nationalId: session.nationalId,
      type,
      status,
      description,
      createdBy: session.userId,
    },
  });
  return NextResponse.json({ driverCase });
};

export const GET = withAuth(getDriverCases);
export const POST = withAuth(postDriverAction);
