import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Mock user profile
  const profile = {
    citizenId: '3500200461028',
    role: 'DEVELOPER',
    name: 'Admin'
  };
  return NextResponse.json(profile);
}
