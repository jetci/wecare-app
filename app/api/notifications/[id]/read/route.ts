import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AuthSession } from '@/types/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await verifyAuth(req);
  if (authResult instanceof NextResponse) {
    return authResult; // Return the error response directly
  }
  const session = authResult as AuthSession;
  const { id: notificationId } = params;

  if (!notificationId) {
    return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
  }

  try {
    // First, find the notification to ensure it exists and get its targetUserId
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    // IMPORTANT: Verify that the logged-in user is the target of the notification
    if (notification.targetUserId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // If all checks pass, update the notification
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
