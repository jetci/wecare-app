import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  CommunityRequestsQuerySchema,
  GetCommunityHistoryResponseSchema,
} from '@/schemas/community.schema';

export async function GET(req: Request) {
  // ตรวจสอบ token จาก cookie
  const cookie = req.headers.get('cookie') || '';
  const token = cookie.split(';').find(x => x.trim().startsWith('accessToken='));
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { nationalId } = CommunityRequestsQuerySchema.parse({
      nationalId: new URL(req.url).searchParams.get('nationalId'),
    });
    // Fetch all community request history
    const history = await prisma.requestUser.findMany({
      where: { nationalId },
      select: {
        id: true,
        nationalId: true,
        type: true,
        status: true,
        details: true,
        createdAt: true,
      },
    });
    const result = GetCommunityHistoryResponseSchema.parse(history);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
