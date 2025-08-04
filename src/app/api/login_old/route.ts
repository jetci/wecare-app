import { NextResponse } from 'next/server';

// This is a simplified version for debugging the 404 issue.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nationalId, password } = body;

    // Mock validation for the specific test case
    if (nationalId === '0000000000000' && password === 'password123') {
      console.log('[API /api/login] Debug route hit successfully!');
      return NextResponse.json({ message: 'Debug route OK', token: 'mock-jwt-token' });
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    console.error('[API /api/login] Error in debug route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
