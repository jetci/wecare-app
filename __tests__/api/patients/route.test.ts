import { NextRequest, NextResponse } from 'next/server';
import { GET } from '../../../../app/api/patients/route';
import { PrismaClient } from '@prisma/client';
import * as jose from 'jose';

jest.mock('@prisma/client', () => {
  const mPrisma = {
    patient: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});

jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
}));

describe('GET /api/patients', () => {
  const prisma = new PrismaClient() as any;
  const mockVerify = jose.jwtVerify as jest.Mock;

  const buildRequest = (token?: string, url = 'http://localhost/api/patients') => {
    const headers = new Headers();
    if (token) headers.set('authorization', `Bearer ${token}`);
    return new NextRequest(url, { headers });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 if no token provided', async () => {
    mockVerify.mockRejectedValue(new Error('Unauthorized'));
    const req = buildRequest();
    const res = await GET(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('returns 403 if role not allowed', async () => {
    mockVerify.mockResolvedValue({ payload: { userId: 'u1', role: 'USER' } });
    const req = buildRequest('token');
    const res = await GET(req);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('Forbidden');
  });

  it('returns patients for COMMUNITY role with pagination and search', async () => {
    mockVerify.mockResolvedValue({ payload: { userId: 'u1', role: 'COMMUNITY' } });
    prisma.patient.count.mockResolvedValue(2);
    prisma.patient.findMany.mockResolvedValue([{ id: 'p1' }, { id: 'p2' }]);

    const req = buildRequest('token', 'http://localhost/api/patients?search=test&page=2&limit=1');
    const res = await GET(req);
    expect(prisma.patient.count).toHaveBeenCalledWith({ where: { managedByUserId: 'u1', OR: expect.any(Array) } });
    expect(prisma.patient.findMany).toHaveBeenCalledWith({ where: expect.any(Object), skip: 1, take: 1 });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.patients).toHaveLength(2);
    expect(json.total).toBe(2);
  });

  it('returns patients for DEVELOPER role unrestricted', async () => {
    mockVerify.mockResolvedValue({ payload: { userId: 'u2', role: 'DEVELOPER' } });
    prisma.patient.count.mockResolvedValue(1);
    prisma.patient.findMany.mockResolvedValue([{ id: 'p3' }]);

    const req = buildRequest('token', 'http://localhost/api/patients');
    const res = await GET(req);
    expect(prisma.patient.count).toHaveBeenCalledWith({ where: {} });
    expect(prisma.patient.findMany).toHaveBeenCalledWith({ where: {}, skip: 0, take: 10 });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.patients).toEqual([{ id: 'p3' }]);
    expect(json.total).toBe(1);
  });
});
