import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

// Encode the JWT secret once outside of the middleware function for performance.
const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

// Define the access control list (ACL) for different dashboard areas.
const acl: Record<string, string[]> = {
  community: ['COMMUNITY', 'ADMIN', 'DRIVER', 'HEALTH_OFFICER', 'EXECUTIVE', 'DEVELOPER'],
  admin: ['ADMIN', 'DEVELOPER'],
  driver: ['DRIVER', 'ADMIN', 'DEVELOPER'],
  'health-officer': ['HEALTH_OFFICER', 'ADMIN', 'DEVELOPER'],
  executive: ['EXECUTIVE', 'ADMIN', 'DEVELOPER'],
  developer: ['DEVELOPER'],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Bypass auth for E2E testing
  if (
    req.nextUrl.searchParams.get('e2e') === 'true' ||
    req.cookies.get('e2e')?.value === 'true'
  ) {
    return NextResponse.next();
  }

  // 2. Define public routes that don't require authentication
  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/_next',
  ];

  if (pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // 3. Handle protected routes (all other routes)
  const cookieToken = req.cookies.get('accessToken')?.value;
  const authHeader = req.headers.get('authorization');
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  const token = cookieToken || headerToken;

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    // 4. Verify the JWT token
    const { payload } = await jose.jwtVerify(token, secret);
    const role = payload.role as string;

    // 5. Enforce RBAC for /dashboard routes
    if (pathname.startsWith('/dashboard')) {
      const [, , area] = pathname.split('/');
      const allowedRoles = acl[area];

      if (!allowedRoles || !allowedRoles.includes(role)) {
        // Redirect to a general dashboard page if user's role is not allowed for the specific area
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // 6. If token is valid and role is authorized, proceed
    return NextResponse.next();

  } catch (error) {
    // 7. If token verification fails, redirect to login
    console.error('JWT Verification Error:', error);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
