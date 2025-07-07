import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/officer/patients/route';

// Test GET /api/officer/patients
describe('GET /api/officer/patients', () => {
  it('returns 200 and array', async () => {
    const req = new Request('http://localhost/api/officer/patients?area=test');
    const res = await GET(req as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });
});
