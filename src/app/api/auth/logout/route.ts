import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST() {
  try {
    // Create a cookie that expires in the past to effectively delete it
    const serializedCookie = serialize('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: -1, // Set maxAge to a past date
      path: '/',
    });

    const response = NextResponse.json({ message: 'Logout successful' }, { status: 200 });
    response.headers.set('Set-Cookie', serializedCookie);

    return response;

  } catch (error) {
    console.error('[LOGOUT_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
