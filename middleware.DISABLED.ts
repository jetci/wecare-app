import { NextRequest, NextResponse } from 'next/server'
import * as jose from 'jose';
import jwt from 'jsonwebtoken';

export async function middleware(req: NextRequest) {
  // Bypass auth and redirects for E2E testing when ?e2e=true (query param or cookie)
  if (
    req.nextUrl.searchParams?.get('e2e') === 'true' ||
    req.cookies?.get('e2e')?.value === 'true'
  ) {
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl
  // Public routes: home, auth pages, API
  if (
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next()
  }

  // Extract token from cookie or Authorization header
  const cookieToken = req.cookies?.get('accessToken')?.value;
  const authHeader = req.headers.get('authorization');
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  const token = headerToken || cookieToken;

  // header-based auth
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      await jose.jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // protected routes under /dashboard
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    try {
      // Verify JWT
      await jose.jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
      const payload = jwt.verify(token, process.env.JWT_SECRET || '') as { role: string };
      const role = payload.role;
      const url = req.nextUrl.clone();
      const [, , area] = url.pathname.split('/');
      // define allowed roles per area
      const acl: Record<string, string[]> = {
        community: ['COMMUNITY', 'ADMIN', 'DRIVER', 'HEALTH_OFFICER', 'EXECUTIVE', 'DEVELOPER'],
        admin: ['ADMIN', 'DEVELOPER'],
        driver: ['DRIVER', 'ADMIN', 'DEVELOPER'],
        'health-officer': ['HEALTH_OFFICER', 'ADMIN', 'DEVELOPER'],
        executive: ['EXECUTIVE', 'ADMIN', 'DEVELOPER'],
        developer: ['DEVELOPER'],
      };

      const allowed = acl[area];
      if (!allowed || !allowed.includes(role)) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/:path*'], // apply middleware to all pages
}
