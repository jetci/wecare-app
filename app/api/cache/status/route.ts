import { NextResponse } from 'next/server';

export async function GET() {
  // Sample cache metrics
  const cacheStats = {
    hits: Math.floor(Math.random() * 1000),
    misses: Math.floor(Math.random() * 100),
    keysCount: Math.floor(Math.random() * 500),
  };
  return NextResponse.json(cacheStats);
}
