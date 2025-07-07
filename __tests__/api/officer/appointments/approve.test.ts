import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/officer/appointments/[id]/approve/route';

// Test POST /api/officer/appointments/[id]/approve
describe('POST /api/officer/appointments/[id]/approve', () => {
  it('returns 200 and approved appointment', async () => {
    const context = { params: { id: '00000000-0000-0000-0000-000000000000' } } as any;
    const res = await POST(undefined as any, context);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('id', context.params.id);
    expect(data).toHaveProperty('status', 'approved');
  });
});
