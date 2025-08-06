import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const verification = await verifyAuth(req);
  if (!verification.success) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { user } = verification;
  if (user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = params;

  try {
    // Check if the notification exists
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    await prisma.notification.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Notification deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting notification ${id}:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
