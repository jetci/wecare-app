import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';

// Define the structure of the JWT payload
interface UserJwtPayload {
  userId: string;
  role: 'ADMIN' | 'COMMUNITY' | 'DRIVER' | 'OFFICER' | 'EXECUTIVE' | 'DEVELOPER';
  iat: number;
  exp: number;
}

// Function to get the JWT secret key from environment variables
const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in the environment variables');
  }
  return new TextEncoder().encode(secret);
};

export async function GET(request: NextRequest) {
  const tokenCookie = request.cookies.get('token');

  if (!tokenCookie) {
    // No token found, user is not authenticated
    return NextResponse.json({ message: 'Authentication token not found.' }, { status: 401 });
  }

  const token = tokenCookie.value;

  try {
    // Verify the token using the secret key
    const { payload } = await jwtVerify<UserJwtPayload>(token, getJwtSecretKey());

    // Find the user in the database based on the token's payload
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        nationalId: true,
        role: true,
      },
    });

    if (!user) {
      // User not found in the database, treat as invalid token
      const response = NextResponse.json({ message: 'User not found.' }, { status: 404 });
      response.cookies.set('token', '', { expires: new Date(0), path: '/' }); // Clear the cookie
      return response;
    }

    // User is verified, return user data
    return NextResponse.json(user);

  } catch (error) {
    // Token is invalid (expired, malformed, etc.)
    // Do not log the error in production for security reasons, but it's useful for debugging
    // console.error('Token verification failed:', error);
    const response = NextResponse.json({ message: 'Invalid or expired token.' }, { status: 401 });
    // Clear the invalid token from the browser
    response.cookies.set('token', '', { expires: new Date(0), path: '/' });
    return response;
  }
}
