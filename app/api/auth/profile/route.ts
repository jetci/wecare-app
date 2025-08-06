import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { AuthSession } from '@/types/auth';

export async function GET(request: NextRequest) {
  const session = await verifyAuth(request);

  // verifyAuth returns a NextResponse on error, so we can just return it.
  if (session instanceof NextResponse) {
    return session;
  }

  // Now, session is guaranteed to be AuthSession.
  return NextResponse.json({
    id: session.userId,
    name: session.name,
    role: session.role,
  });
}
