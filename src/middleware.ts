import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware นี้จะปกป้องเฉพาะหน้าเว็บ dashboard เท่านั้น
export function middleware(req: NextRequest) {
  const token = req.cookies.get('accessToken');
  if (!token && req.nextUrl.pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};

