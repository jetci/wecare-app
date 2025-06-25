import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, PUT, DELETE } from './route';
import { mockPatients } from '../route';
import { verifyToken, } from '@/lib/auth';
import { NextResponse, NextRequest } from 'next/server';


vi.mock('@/lib/auth', () => ({ verifyToken: vi.fn() }));

function makeReq(
  method: string,
  body?: any,
  auth: string = 'Bearer token'
): NextRequest {
  const init: { method: string; headers: Record<string, string>; body?: string } = { method, headers: { Authorization: auth, 'user-agent': 'test' } }; 
  if (body !== undefined) {
    init.body = JSON.stringify(body);
    init.headers = { ...init.headers, 'Content-Type': 'application/json' };
  }
  return new NextRequest('http://', init);
}

describe('GET /api/patients/[id]', () => {
  beforeEach(() => {
    mockPatients.length = 0;
    (verifyToken as any).mockReset();
  });

  it('should return 400 for invalid id', async () => {
    (verifyToken as any).mockResolvedValue({ userId: 'u', role: 'ADMIN' });
    const res = await GET(makeReq('GET'), { params: { id: 'bad-id' } });
    expect(res.status).toBe(400);
  });

  it('should return 401 if unauthorized', async () => {
    (verifyToken as any).mockResolvedValue(new NextResponse(null, { status: 401 }));
    const res = await GET(makeReq('GET'), { params: { id: '123e4567-e89b-12d3-a456-426614174000' } });
    expect(res.status).toBe(401);
  });

  it('should return 404 if not found', async () => {
    (verifyToken as any).mockResolvedValue({ userId: 'u', role: 'ADMIN' });
    const res = await GET(makeReq('GET'), { params: { id: '123e4567-e89b-12d3-a456-426614174000' } });
    expect(res.status).toBe(404);
  });

  it('should return 200 and patient on success', async () => {
    (verifyToken as any).mockResolvedValue({ userId: 'u', role: 'ADMIN' });
    const patient = { id: '123e4567-e89b-12d3-a456-426614174000', name: 'John Doe', age: 30 };
    mockPatients.push(patient as any);
    const res = await GET(makeReq('GET'), { params: { id: patient.id } });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.patient).toEqual(patient);
  });
});

describe('PUT /api/patients/[id]', () => {
  beforeEach(() => {
    mockPatients.length = 0;
    (verifyToken as any).mockReset();
  });

  it('should return 400 for invalid id', async () => {
    (verifyToken as any).mockResolvedValue({ userId: 'u', role: 'ADMIN' });
    const res = await PUT(makeReq('PUT', { name: 'X' }), { params: { id: 'bad-id' } });
    expect(res.status).toBe(400);
  });

  it('should return 401 if unauthorized', async () => {
    (verifyToken as any).mockResolvedValue(new NextResponse(null, { status: 401 }));
    const res = await PUT(makeReq('PUT', { name: 'X' }), { params: { id: '123e4567-e89b-12d3-a456-426614174000' } });
    expect(res.status).toBe(401);
  });

  it('should return 400 for invalid body', async () => {
    (verifyToken as any).mockResolvedValue({ userId: 'u', role: 'ADMIN' });
    const res = await PUT(makeReq('PUT', { invalid: true }), { params: { id: '123e4567-e89b-12d3-a456-426614174000' } });
    expect(res.status).toBe(400);
  });

  it('should return 404 if patient not found', async () => {
    (verifyToken as any).mockResolvedValue({ userId: 'u', role: 'ADMIN' });
    const res = await PUT(makeReq('PUT', { name: 'X' }), { params: { id: '123e4567-e89b-12d3-a456-426614174000' } });
    expect(res.status).toBe(404);
  });

  it('should update and return 200 on success', async () => {
    (verifyToken as any).mockResolvedValue({ userId: 'u', role: 'ADMIN' });
    const patient = { id: '123e4567-e89b-12d3-a456-426614174000', name: 'Old', age: 25 };
    mockPatients.push(patient as any);
    const res = await PUT(makeReq('PUT', { name: 'New' }), { params: { id: patient.id } });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.patient.name).toBe('New');
  });
});

describe('DELETE /api/patients/[id]', () => {
  beforeEach(() => {
    mockPatients.length = 0;
    (verifyToken as any).mockReset();
  });

  it('should return 400 for invalid id', async () => {
    (verifyToken as any).mockResolvedValue({ userId: 'u', role: 'ADMIN' });
    const res = await DELETE(makeReq('DELETE'), { params: { id: 'bad-id' } });
    expect(res.status).toBe(400);
  });

  it('should return 401 if unauthorized', async () => {
    (verifyToken as any).mockResolvedValue(new NextResponse(null, { status: 401 }));
    const res = await DELETE(makeReq('DELETE'), { params: { id: '123e4567-e89b-12d3-a456-426614174000' } });
    expect(res.status).toBe(401);
  });

  it('should return 404 if patient not found', async () => {
    (verifyToken as any).mockResolvedValue({ userId: 'u', role: 'ADMIN' });
    const res = await DELETE(makeReq('DELETE'), { params: { id: '123e4567-e89b-12d3-a456-426614174000' } });
    expect(res.status).toBe(404);
  });

  it('should delete and return 204 on success', async () => {
    (verifyToken as any).mockResolvedValue({ userId: 'u', role: 'ADMIN' });
    const patient = { id: '123e4567-e89b-12d3-a456-426614174000', name: 'ToDelete', age: 40 };
    mockPatients.push(patient as any);
    const res = await DELETE(makeReq('DELETE'), { params: { id: patient.id } });
    expect(res.status).toBe(204);
    const getRes = await GET(makeReq('GET'), { params: { id: patient.id } });
    expect(getRes.status).toBe(404);
  });
});
