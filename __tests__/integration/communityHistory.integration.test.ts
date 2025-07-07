import request from 'supertest';
import { describe, it, expect, beforeAll, vi, afterAll } from 'vitest';
import { GetCommunityHistoryResponseSchema } from '@/schemas/community.schema';
import app from '@/test-utils/testApp';
import prisma from '@/lib/prisma';

const historyData = [
  {
    id: 1,
    nationalId: '1234567890123',
    type: 'help',
    status: 'approved',
    details: 'ผ่านการอนุมัติ',
    createdAt: new Date().toISOString(),
  },
];

describe('GET /api/community/history', () => {
  beforeAll(() => {
    vi.spyOn(prisma.requestUser, 'findMany').mockImplementation(async (args: any) => {
      // filter mock
      let filtered = historyData;
      if (args.where?.nationalId) filtered = filtered.filter(r => r.nationalId === args.where.nationalId);
      return filtered;
    });
  });
  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('ควรคืนข้อมูล history ตาม schema', async () => {
    const res = await request(app).get('/api/community/history?nationalId=1234567890123');
    expect(res.status).toBe(200);
    const parsed = GetCommunityHistoryResponseSchema.parse(res.body);
    expect(parsed.length).toBe(1);
    expect(parsed[0].nationalId).toBe('1234567890123');
  });

  it('ควรคืน empty array เมื่อ nationalId ไม่พบ', async () => {
    const res = await request(app).get('/api/community/history?nationalId=0000000000000');
    expect(res.status).toBe(200);
    const parsed = GetCommunityHistoryResponseSchema.parse(res.body);
    expect(parsed).toEqual([]);
  });
});
