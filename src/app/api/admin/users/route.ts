import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

const ALLOWED_ROLES = ['ADMIN', 'EXECUTIVE', 'DEVELOPER'];

export async function GET(req: Request) {
  try {
    const session = await verifyAuth();
    if (!session || !session.user?.role || !ALLOWED_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        nationalId: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        position: true,
        isApproved: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    if (error instanceof Error && error.message.includes('Authentication required')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
