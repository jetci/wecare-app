import '@testing-library/jest-dom/vitest';
// Mock jose.jwtVerify before imports
vi.mock('jose', () => ({ jwtVerify: vi.fn() }));

import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import type { Mock } from 'vitest';
import { NextResponse } from 'next/server';
import { middleware } from './middleware';
import * as jose from 'jose';

// Helper to create a stub NextRequest
const makeReq = ({ pathname, cookie, authHeader }: { pathname: string; cookie?: string; authHeader?: string }) => {
  const url = `http://localhost${pathname}`;
  const parsed = new URL(url);
  return {
    nextUrl: {
      pathname,
      // use real URLSearchParams to stub searchParams.get
      searchParams: parsed.searchParams,
      clone: () => ({ pathname }) as any
    } as any,
    url,
    cookies: { get: (_: string) => cookie ? { value: cookie } : undefined } as any,
    headers: { get: (_: string) => authHeader } as any,
  } as any;
};

describe('JWT middleware', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  beforeEach(() => {
    // Reset jwtVerify mock
    (jose.jwtVerify as Mock).mockReset();
  });

  it('redirects to /login when no token on protected route', async () => {
    const req = makeReq({ pathname: '/dashboard/community' });
    const res = await middleware(req);
    expect(res instanceof NextResponse).to.equal(true);
    expect(res.headers.get('location')).to.equal('http://localhost/login');
  });

  it('redirects to /login when invalid token', async () => {
    // Mock jwtVerify to throw for invalid token
    (jose.jwtVerify as Mock).mockRejectedValue(new Error('invalid token'));
    const req = makeReq({ pathname: '/dashboard/community', cookie: 'invalid' });
    const res = await middleware(req);
    expect(res.headers.get('location')).to.equal('http://localhost/login');
  });

  it('allows when valid header token', async () => {
    // Mock jwtVerify to return community role
    (jose.jwtVerify as Mock).mockResolvedValue({ payload: { role: 'community' } } as any);
    // provide auth header
    const fakeJwt = 'valid.token';
    const req = makeReq({ pathname: '/dashboard/community', authHeader: `Bearer ${fakeJwt}` });
    const res = await middleware(req);
    expect(res).toEqual(NextResponse.next());
  });

  it('allows when valid cookie token', async () => {
    // Mock jwtVerify to return community role
    (jose.jwtVerify as Mock).mockResolvedValue({ payload: { role: 'community' } } as any);
    const token = 'valid.cookie.token';
    const req = makeReq({ pathname: '/dashboard/community', cookie: token });
    const res = await middleware(req);
    expect(res).toEqual(NextResponse.next());
  });

  it('redirects when auth header missing Bearer prefix', async () => {
    const req = makeReq({ pathname: '/dashboard/community', authHeader: 'Token invalid' });
    const res = await middleware(req);
    expect(res.headers.get('location')).to.equal('http://localhost/login');
  });
});

