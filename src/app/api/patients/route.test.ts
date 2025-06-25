import { NextRequest } from 'next/server';
import { GET, POST, mockPatients } from './route';
import { verifyToken } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({ verifyToken: vi.fn() }));

describe('/api/patients API', () => {
  const makeReq = (body?: any) => ({
    nextUrl: { searchParams: new URLSearchParams() },
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => body,
  } as unknown as NextRequest);

  beforeEach(() => {
    mockPatients.length = 0;
    (verifyToken as any).mockReset();
  });

  it('GET returns patients array', async () => {
    (verifyToken as any).mockResolvedValue({ userId: 'u1', role: 'COMMUNITY' });
    const resp = await GET(makeReq());
    expect(resp.status).toBe(200);
    const data = await resp.json();
    expect(Array.isArray(data.patients)).toBe(true);
  });

  it('POST missing required returns 400', async () => {
    (verifyToken as any).mockResolvedValue({ userId: 'u1', role: 'COMMUNITY' });
    const req = makeReq({});
    const resp = await POST(req);
    expect(resp.status).toBe(400);
  });

  it('POST valid body returns 201', async () => {
    (verifyToken as any).mockResolvedValue({ userId: 'u1', role: 'COMMUNITY' });
    const valid = { nationalId: '1234567890123', firstName: 'Test', lastName: 'User' };
    const req = makeReq(valid);
    const resp = await POST(req);
    expect(resp.status).toBe(201);
    const data = await resp.json();
    expect(data.patient.nationalId).toBe(valid.nationalId);
  });
});
