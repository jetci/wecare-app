import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createNotificationSchema } from '@/schemas/notification.schema';
import { AuthSession } from '@/types/auth';

export async function POST(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) {
    return authResult; // Return the error response directly
  }
  // If we get here, auth was successful and authResult is an AuthSession
  const session = authResult as AuthSession;

  try {
    const body = await req.json();
    const validation = createNotificationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { targetUserId, type, message } = validation.data;

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    const notification = await prisma.notification.create({
      data: {
        targetUserId,
        type,
        message,
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) {
    return authResult; // Return the error response directly
  }
  // If we get here, auth was successful and authResult is an AuthSession
  const session = authResult as AuthSession;

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        targetUserId: session.userId, // Use the userId from the session
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
