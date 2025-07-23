import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { AuthenticatedApiHandler } from '@/lib/auth-handler';

interface RateRecord {
  count: number;
  start: number;
}

const rateMap = new Map<string, RateRecord>();

/**
 * Simple in-memory rate limiter middleware for API routes.
 * path-based + IP-based limiting.
 */
export function rateLimit(
  handler: AuthenticatedApiHandler,
  maxRequests = 60,
  windowMs = 60_000
) {
  return async (req: NextRequest, context: any, session: any) => {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const key = `${ip}:${req.nextUrl.pathname}`;
    const now = Date.now();
    const record = rateMap.get(key);
    if (!record || now - record.start > windowMs) {
      rateMap.set(key, { count: 1, start: now });
    } else {
      if (record.count >= maxRequests) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      }
      record.count++;
      rateMap.set(key, record);
    }
    return handler(req, context, session);
  };
}
