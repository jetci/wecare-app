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
 * Includes a "God Mode" for the developer user ID specified in .env.
 * @param handler The API route handler to protect.
 * @returns A new handler that includes authentication checks.
 */
export function withAuth(handler: AuthenticatedApiHandler) {
  return async (req: NextRequest, context: { params: any }): Promise<NextResponse> => {
    try {
      const session = await verifyAuth(req);

      // ถ้าไม่มี session หรือ token ไม่ถูกต้อง ให้ปฏิเสธการเข้าถึง
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
      }

      // --- [LOGIC ใหม่] ตรวจสอบ God Mode สำหรับ API ---
      const isDeveloper = session.userId === process.env.NEXT_PUBLIC_DEV_USER_ID;

      if (isDeveloper) {
        // ถ้าเป็นผู้พัฒนา, สร้าง session จำลองที่มี role เป็น ADMIN
        const devSession: AuthSession = { ...session, role: 'DEVELOPER' };
        return handler(req, context, devSession);
      }
      // --------------------------------------------

      // ถ้าไม่ใช่ผู้พัฒนา, ให้ใช้ session ปกติส่งต่อไป
      return handler(req, context, session);

    } catch (error) {
      console.error('Authentication error in withAuth wrapper:', error);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
  };
}
