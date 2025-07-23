import { NextResponse } from 'next/server';
import type { AuthenticatedApiHandler } from '@/lib/auth-handler';

/**
 * ACL middleware: wrap handler to allow only specified roles or dev override.
 */
export function withAcl(
  handler: AuthenticatedApiHandler,
  allowedRoles: string[]
) {
  return async (req: Request, context: any, session: any) => {
    const devUserId = process.env.NEXT_PUBLIC_DEV_USER_ID;
    // allow dev override
    if (session.userId === devUserId) {
      return handler(req as any, context, session);
    }
    // check roles
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    return handler(req as any, context, session);
  };
}
