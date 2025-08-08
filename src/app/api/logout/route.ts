import { NextResponse } from 'next/server';

/**
 * API route to handle user logout.
 * It clears the `accessToken` cookie by setting its expiration to a past date,
 * effectively logging the user out from the server's perspective.
 */
export async function POST() {
  try {
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    // To clear a cookie, set its name, an empty value, and maxAge to 0.
    response.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0, // Expire the cookie immediately
    });

    console.log('[API/Logout] accessToken cookie cleared.');

    return response;
  } catch (error) {
    console.error('[API/Logout] Error during logout:', error);
    return NextResponse.json(
      { success: false, message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
