import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { GetUsersSchema } from '@/schemas/community/user.schema';
import { Role } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await verifyAuth(req);

    if (session instanceof NextResponse) {
      return session; // Early return if auth fails
    }

    if (session.role !== Role.ADMIN) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validation = GetUsersSchema.safeParse({ query: queryParams });

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.format() }, { status: 400 });
    }

    const { page, limit, search } = validation.data.query;
    const skip = (page - 1) * limit;

    const searchPattern = search ? `%${search}%` : '%%';

    // Using $queryRaw for flexible case-insensitive search across multiple fields
    const users = await prisma.$queryRaw`
      SELECT * FROM "User"
      WHERE name ILIKE ${searchPattern}
         OR "nationalId" ILIKE ${searchPattern}
         OR email ILIKE ${searchPattern}
      ORDER BY "createdAt" DESC
      LIMIT ${limit}
      OFFSET ${skip};
    `;

    const totalResult: { count: bigint }[] = await prisma.$queryRaw`
      SELECT COUNT(*) FROM "User"
      WHERE name ILIKE ${searchPattern}
         OR "nationalId" ILIKE ${searchPattern}
         OR email ILIKE ${searchPattern};
    `;

    const total = Number(totalResult[0].count);

    return NextResponse.json({
      users,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('GET /api/users Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.format() }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
