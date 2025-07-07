import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // consume body without destructuring to avoid unused vars
  await request.json();
  // TODO: schedule via cron or external service
  return NextResponse.json({ success: true });
}
