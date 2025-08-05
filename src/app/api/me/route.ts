import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, JWTPayload } from 'jose';
import prisma from '@/lib/prisma';

// Define a strict type for the JWT payload to avoid using 'any'
interface UserJwtPayload extends JWTPayload {
  userId: string;
  role: string;
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

/**
 * GET /api/me
 * Retrieves the authenticated user's profile information.
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Extract token from Authorization header or cookie
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    // 2. Verify the token using 'jose' library
    const { payload } = await jwtVerify<UserJwtPayload>(token, JWT_SECRET);

    if (!payload.userId) {
      return NextResponse.json({ message: 'Invalid token payload' }, { status: 401 });
    }

    // 3. Fetch user from database using the userId from token
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      // 4. Select only the necessary and safe fields to return
      select: {
        id: true,
        nationalId: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // On success, return the user data
    return NextResponse.json(user);

  } catch (error: unknown) {
    console.error('[API /me Error]', error);

    // Handle specific error from jwtVerify (e.g., expired or invalid token)
    if (error instanceof Error && (error.name === 'JWTExpired' || error.name === 'JWSInvalid')) {
        return NextResponse.json({ message: `Authentication error: ${error.message}` }, { status: 401 });
    }

    // Generic server error
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
