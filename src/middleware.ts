import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Redirect unauthenticated users from /dashboard to login
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('accessToken');
  if (pathname.startsWith('/dashboard') && !token) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

// Apply middleware to dashboard routes
export const config = {
  matcher: ['/dashboard/:path*'],
};
