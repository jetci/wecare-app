import '@testing-library/jest-dom/vitest';
import { NextResponse } from 'next/server';
import { GET, POST } from '../../../src/app/api/driver/cases/route';
import prisma from '../../../src/lib/prisma';
import { verifyToken } from '../../../src/lib/auth';

jest.mock('../../../src/lib/auth');
jest.mock('../../../src/lib/prisma');

describe('Driver Cases API', () => {
  const mockDriver = { userId: 'driver-uuid', role: 'DRIVER' };

  beforeEach(() => {
    (verifyToken as jest.Mock).mockResolvedValue(mockDriver);
  });
  afterEach(() => { jest.resetAllMocks(); });

  it('GET /api/driver/cases returns cases list', async () => {
    const fakeCases = [{ id: '1', status: 'PENDING', driverId: null, patient: {} }];
    (prisma.ride.findMany as jest.Mock).mockResolvedValue(fakeCases);

    const req = new Request('http://localhost');
    const res = await GET(req);
    expect(res).toBeInstanceOf(NextResponse);
    const body = await (res as NextResponse).json();
    expect(body).toEqual({ success: true, cases: fakeCases });
  });

  it('POST accept transitions PENDING to ACCEPTED', async () => {
    const ride = { id: '1', status: 'PENDING', driverId: null };
    (prisma.ride.findUnique as jest.Mock).mockResolvedValue(ride);
    const updated = { ...ride, status: 'ACCEPTED', driverId: mockDriver.userId };
    (prisma.ride.update as jest.Mock).mockResolvedValue(updated);

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ id: '1', action: 'accept' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    const body = await (res as NextResponse).json();
    expect(body).toEqual({ success: true, ride: updated });
  });

  it('POST complete transitions IN_PROGRESS to COMPLETED', async () => {
    const ride = { id: '2', status: 'IN_PROGRESS', driverId: mockDriver.userId };
    (prisma.ride.findUnique as jest.Mock).mockResolvedValue(ride);
    const updated = { ...ride, status: 'COMPLETED' };
    (prisma.ride.update as jest.Mock).mockResolvedValue(updated);

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ id: '2', action: 'complete' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    const body = await (res as NextResponse).json();
    expect(body).toEqual({ success: true, ride: updated });
  });
});

