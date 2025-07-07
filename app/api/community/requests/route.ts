import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-handler';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const getRequestsQuerySchema = z.object({
  nationalId: z.string(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

const postRequestBodySchema = z.object({
  type: z.string(),
  status: z.string().optional(),
  description: z.string().optional(),
});

const getCommunityRequests = async (
  req: NextRequest,
  _ctx: any,
  session: any
) => {
  if (session.role !== 'COMMUNITY') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const url = new URL(req.url);
  const parseResult = getRequestsQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parseResult.success) {
    return NextResponse.json({ error: 'Invalid query', details: parseResult.error.issues }, { status: 400 });
  }
  const { nationalId, page, limit } = parseResult.data;
  const requests = await prisma.request.findMany({
    where: { nationalId },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ requests });
};

const postCommunityRequest = async (
  req: NextRequest,
  _ctx: any,
  session: any
) => {
  if (session.role !== 'COMMUNITY') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await req.json();
  const parseResult = postRequestBodySchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json({ error: 'Invalid body', details: parseResult.error.issues }, { status: 400 });
  }
  const { type, status, description } = parseResult.data;
  const request = await prisma.request.create({
    data: {
      nationalId: session.nationalId,
      type,
      status,
      description,
      createdBy: session.userId,
    },
  });
  return NextResponse.json({ request });
};

export const GET = withAuth(getCommunityRequests);
export const POST = withAuth(postCommunityRequest);
