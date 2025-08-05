// path: app/api/auth/logout/route.ts

import { NextResponse } from 'next/server';

export async function POST() { // Use POST for consistency with actions that change state
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

  // Set the cookie with an expired date to effectively delete it
  response.cookies.set('token', '', {
    httpOnly: true,
    path: '/',
    expires: new Date(0),
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}
