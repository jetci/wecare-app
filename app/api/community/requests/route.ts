import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, type AuthenticatedApiHandler } from '@/lib/auth-handler';
import { z } from 'zod';
import {
  CommunityRequestsQuerySchema,
  GetCommunityRequestsResponseSchema,
  CreateCommunityRequestBodySchema,
  CreateCommunityRequestResponseSchema,
} from '@/schemas/community.schema';

/**
 * Handler สำหรับดึงรายการคำขอของผู้ใช้
 */
const getCommunityRequests: AuthenticatedApiHandler = async (req, context, session) => {
  // อนุญาตให้เข้าถึงได้ถ้าเป็น COMMUNITY หรือ DEVELOPER
  if (!['COMMUNITY', 'DEVELOPER', 'OFFICER', 'ADMIN'].includes(session.role)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const url = new URL(req.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const parsedQuery = CommunityRequestsQuerySchema.extend({
      type: z.string().optional(),
      status: z.string().optional(),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(10),
    }).safeParse(queryParams);

    if (!parsedQuery.success) {
      return NextResponse.json({ success: false, error: 'Invalid query parameters', details: parsedQuery.error.flatten() }, { status: 400 });
    }

    const { type, status, page, limit } = parsedQuery.data;
    const skip = (page - 1) * limit;
    const whereCondition: any = {
      ...(session.role === 'COMMUNITY' ? { userId: session.userId } : {}),
    };
    if (type) whereCondition.type = type;
    if (status) whereCondition.status = status;

    const [requests, total] = await prisma.$transaction([
      prisma.requestUser.findMany({ where: whereCondition, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.requestUser.count({ where: whereCondition }),
    ]);

    return NextResponse.json({
      success: true,
      data: requests,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('🔥 GET /api/community/requests Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
};

/**
 * Handler สำหรับสร้างคำขอใหม่
 */
const createCommunityRequest: AuthenticatedApiHandler = async (req, context, session) => {
  if (!['COMMUNITY', 'DEVELOPER', 'OFFICER', 'ADMIN'].includes(session.role)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const payload = CreateCommunityRequestBodySchema.parse(await req.json());
    const newRequest = await prisma.requestUser.create({
      data: { ...payload, userId: session.userId, status: 'PENDING' },
    });
    const result = CreateCommunityRequestResponseSchema.parse(newRequest);
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    console.error('🔥 POST /api/community/requests Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Invalid request body', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
};

// Export handlers
export const GET = withAuth(getCommunityRequests);
export const POST = withAuth(createCommunityRequest);