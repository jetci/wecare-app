import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from 'jose';
import prisma from "@/lib/prisma";
import type { AuthSession } from '@/lib/auth';

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT Secret key is not set in environment variables!');
  }
  return new TextEncoder().encode(secret);
};

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Authentication token not found." }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    const decoded = payload as unknown as AuthSession;

    if (!decoded || typeof decoded.userId !== 'string') {
      throw new Error("Invalid token payload");
    }

    // Fetch user from database to ensure they still exist and have correct roles
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        nationalId: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // Return the user data, which will be used to set the auth context state
    return NextResponse.json(user, { status: 200 });

  } catch (error) {
    console.error("Verify API Error:", error);
    // Clear the invalid cookie by setting an expired one
    const response = NextResponse.json({ message: "Invalid or expired token." }, { status: 401 });
    response.cookies.set("token", "", { httpOnly: true, expires: new Date(0), path: "/" });
    return response;
  }
}
