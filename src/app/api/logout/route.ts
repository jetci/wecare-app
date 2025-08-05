import { NextResponse } from 'next/server';

export async function POST() {
  // Create a response object
  const response = NextResponse.json({ message: 'Logged out successfully' });

  // Set the cookie on the response to clear it
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    expires: new Date(0), // Set expiry date to the past
  });

  return response;
}
