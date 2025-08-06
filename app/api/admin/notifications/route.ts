import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export async function GET(req: Request) {
  const verification = await verifyAuth(req);
  if (!verification.success) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { user } = verification;
  if (user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const notifications = await prisma.notification.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        targetUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications for admin:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
