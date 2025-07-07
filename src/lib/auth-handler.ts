import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuth, type AuthSession } from '@/lib/auth';

// Type สำหรับ API Handler ที่รับ session เพิ่มเข้ามา
export type AuthenticatedApiHandler = (
  req: NextRequest,
  context: { params: any },
  session: AuthSession
) => Promise<NextResponse>;

/**
 * A higher-order function to protect API routes.
 * It verifies the user's session and passes it to the protected handler.
 * @param handler The API route handler to protect.
 * @returns A new handler that includes authentication checks.
 */
export function withAuth(handler: AuthenticatedApiHandler) {
  return async (req: NextRequest, context: { params: any }): Promise<NextResponse> => {
    try {
      const session = await verifyAuth(req);
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
      }
      return handler(req, context, session);
    } catch (error) {
      console.error('Authentication error in withAuth wrapper:', error);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
  };
}
