import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/officer/appointments/route';

// Test GET /api/officer/appointments
describe('GET /api/officer/appointments', () => {
  it('returns 200 and array', async () => {
    const req = new Request('http://localhost/api/officer/appointments?area=test');
    const res = await GET(req as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });
});
