import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  CommunityRequestsQuerySchema,
  GetCommunityRequestsResponseSchema,
  CreateCommunityRequestBodySchema,
  CreateCommunityRequestResponseSchema,
} from '@/schemas/community.schema';
import { z } from 'zod';
import { withAuth, type AuthenticatedApiHandler } from '@/lib/auth-handler';
import type { AuthSession } from '@/lib/auth';

const getCommunityRequests: AuthenticatedApiHandler = async (req, context, session) => {
  try {
    if (session.role !== 'COMMUNITY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // 2. Parse และ Validate Query Parameters
    const url = new URL(req.url);
    const queryParams = {
      type: url.searchParams.get('type') || undefined,
      status: url.searchParams.get('status') || undefined,
      page: url.searchParams.get('page') || '1',
      limit: url.searchParams.get('limit') || '10',
    };
    const validatedQuery = CommunityRequestsQuerySchema.extend({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(10),
    }).parse(queryParams);
    const { type, status, page, limit } = validatedQuery;
    const skip = (page - 1) * limit;
    // 3. เงื่อนไขค้นหา: เฉพาะ userId ปัจจุบัน
    const whereCondition: any = { userId: session.userId };
    if (type) whereCondition.type = type;
    if (status) whereCondition.status = status;
    // 4. ดึงข้อมูลและจำนวนทั้งหมดจากฐานข้อมูล
    const [requests, total] = await prisma.$transaction([
      prisma.requestUser.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.requestUser.count({ where: whereCondition }),
    ]);
    // 5. Response format + validate
    const responsePayload = {
      data: requests,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
    GetCommunityRequestsResponseSchema.parse(responsePayload);
    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error) {
    console.error('🔥 GET /api/community/requests Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query parameters', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}

const createCommunityRequest: AuthenticatedApiHandler = async (req, context, session) => {
  try {
    if (session.role !== 'COMMUNITY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const payload = CreateCommunityRequestBodySchema.parse(await req.json());
    const newRequest = await prisma.requestUser.create({
      data: { ...payload, status: 'pending', userId: session.userId },
      select: {
        id: true,
        nationalId: true,
        type: true,
        status: true,
        details: true,
        createdAt: true,
      },
    });
    const result = CreateCommunityRequestResponseSchema.parse(newRequest);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
};

export const GET = withAuth(getCommunityRequests);
export const POST = withAuth(createCommunityRequest);
