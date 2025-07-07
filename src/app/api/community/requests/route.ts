import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  CommunityRequestsQuerySchema,
  GetCommunityRequestsResponseSchema,
  CreateCommunityRequestBodySchema,
  CreateCommunityRequestResponseSchema,
} from '@schemas/community.schema';

export async function GET(req: Request) {
  try {
    const { nationalId } = CommunityRequestsQuerySchema.parse({
      nationalId: new URL(req.url).searchParams.get('nationalId'),
    });
    const requests = await prisma.requestUser.findMany({
      where: { nationalId, status: 'pending' },
      select: {
        id: true,
        nationalId: true,
        type: true,
        status: true,
        details: true,
        createdAt: true,
      },
    });
    const result = GetCommunityRequestsResponseSchema.parse(requests);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const payload = CreateCommunityRequestBodySchema.parse(await req.json());
    const newRequest = await prisma.requestUser.create({
      data: { ...payload, status: 'pending' },
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
}
