import { describe, it, expect } from 'vitest';
import { GET as getPatients } from '@/app/api/officer/patients/route';
import { GET as getAppointments } from '@/app/api/officer/appointments/route';
import { POST as approveRoute } from '@/app/api/officer/appointments/[id]/approve/route';
import { POST as denyRoute } from '@/app/api/officer/appointments/[id]/deny/route';
import { NextRequest } from 'next/server';

function buildReq(url: string) {
  return new NextRequest(url);
}

describe('Officer API Integration', () => {
  it('GET /api/officer/patients returns array', async () => {
    const req = buildReq('http://localhost/api/officer/patients');
    const res = await getPatients(req);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('GET /api/officer/appointments returns array', async () => {
    const req = buildReq('http://localhost/api/officer/appointments');
    const res = await getAppointments(req);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('POST approve updates status', async () => {
    const req = buildReq('http://localhost/api/officer/appointments/1/approve');
    const res = await approveRoute(req, { params: { id: '1' } });
    expect(res.status).toBe(200);
  });

  it('POST deny updates status', async () => {
    const req = buildReq('http://localhost/api/officer/appointments/1/deny');
    const res = await denyRoute(req, { params: { id: '1' } });
    expect(res.status).toBe(200);
  });
});
