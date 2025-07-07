import { NextResponse } from 'next/server';

export async function GET() {
  console.log('✅ /api/test was called successfully!');
  return NextResponse.json({ ok: true, timestamp: new Date() });
}
