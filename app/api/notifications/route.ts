import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, type AuthenticatedApiHandler } from '@/lib/auth-handler';
import { rateLimit } from '@/lib/rateLimit';
import { withAcl } from '@/lib/acl';

const getNotifications: AuthenticatedApiHandler = async (_req, _ctx, session) => {
  const notifications = await prisma.notification.findMany({
    where: { targetUserId: session.userId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(notifications);
};
export const GET = withAuth(rateLimit(withAcl(getNotifications, ['COMMUNITY','DRIVER','HEALTH_OFFICER','EXECUTIVE','ADMIN','DEVELOPER'])));

const markRead: AuthenticatedApiHandler = async (req, _ctx, session) => {
  const { id } = await req.json();
  await prisma.notification.updateMany({
    where: { id, targetUserId: session.userId },
    data: { read: true },
  });
  return NextResponse.json({ success: true });
};
export const PATCH = withAuth(rateLimit(withAcl(markRead, ['COMMUNITY','DRIVER','HEALTH_OFFICER','EXECUTIVE','ADMIN','DEVELOPER'])));
