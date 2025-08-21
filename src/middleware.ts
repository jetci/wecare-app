import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import type { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET;

interface TokenPayload {
  userId: string;
  role: Role;
  iat: number;
  exp: number;
}

// Role-based path restrictions
const rolePaths: Record<Role, RegExp> = {
  ADMIN: /^\/admin\/.*$/,
  OFFICER: /^\/community\/.*$/,
  DRIVER: /^\/driver\/.*$/,
  COMMUNITY: /^\/community\/dashboard\/.*$/,
  EXECUTIVE: /^\/executive\/.*$/,
  DEVELOPER: /.*/, // Developer has access to all paths
};

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  // If no token, redirect to login page for protected routes
  if (!token) {
    // Allow access to auth pages and the root
    if (pathname.startsWith('/api/auth') || pathname === '/login' || pathname === '/register' || pathname === '/') {
        return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }
    // Verify the token
    const decoded = await new Promise<TokenPayload>((resolve, reject) => {
        verify(token, JWT_SECRET, (err, payload) => {
            if (err) {
                return reject(err);
            }
            resolve(payload as TokenPayload);
        });
    });

    const userRole = decoded.role;

    // If user is logged in, redirect from auth pages to their dashboard
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
        return NextResponse.redirect(new URL(`/${userRole.toLowerCase()}/dashboard`, req.url));
    }

    // Check if the user's role allows access to the path
    const allowedPath = rolePaths[userRole];
    if (!allowedPath.test(pathname)) {
        // If not allowed, redirect to a generic unauthorized page or their dashboard
        return NextResponse.redirect(new URL('/unauthorized', req.url)); 
    }

    // Add user info to the request headers to be used in server components/pages
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    requestHeaders.set('x-user-role', decoded.role);

    return NextResponse.next({ request: { headers: requestHeaders } });

  } catch (error) {
    // If token is invalid, clear it and redirect to login
    console.error('Invalid token:', error);
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.set('token', '', { maxAge: -1 });
    return response;
  }
}

// Matcher to specify which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
