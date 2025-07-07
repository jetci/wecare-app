import request from 'supertest';
import { describe, it, expect, beforeAll, vi, afterAll } from 'vitest';
import { GetCommunityRequestsResponseSchema } from '@/schemas/community.schema';
import app from '@/test-utils/testApp'; // สมมติว่ามี helper สำหรับ Next.js API route
import prisma from '@/lib/prisma';

const sampleData = [
  {
    id: 1,
    nationalId: '1234567890123',
    type: 'help',
    status: 'pending',
    details: 'ขอความช่วยเหลือ',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    nationalId: '1234567890123',
    type: 'info',
    status: 'approved',
    details: 'สอบถามข้อมูล',
    createdAt: new Date().toISOString(),
  },
];

describe('GET /api/community/requests', () => {
  beforeAll(() => {
    vi.spyOn(prisma.requestUser, 'findMany').mockImplementation(async (args: any) => {
      // filter mock
      let filtered = sampleData;
      if (args.where?.nationalId) filtered = filtered.filter(r => r.nationalId === args.where.nationalId);
      if (args.where?.type) filtered = filtered.filter(r => r.type === args.where.type);
      if (args.where?.status) filtered = filtered.filter(r => r.status === args.where.status);
      if (args.skip !== undefined && args.take !== undefined) filtered = filtered.slice(args.skip, args.skip + args.take);
      return filtered;
    });
  });
  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('ควรคืนข้อมูลตาม schema และ paginate', async () => {
    const res = await request(app).get('/api/community/requests?nationalId=1234567890123&page=1&limit=1');
    expect(res.status).toBe(200);
    const parsed = GetCommunityRequestsResponseSchema.parse(res.body);
    expect(parsed.length).toBe(1);
    expect(parsed[0].nationalId).toBe('1234567890123');
  });

  it('ควร filter ตาม type และ status', async () => {
    const res = await request(app).get('/api/community/requests?type=info&status=approved');
    expect(res.status).toBe(200);
    const parsed = GetCommunityRequestsResponseSchema.parse(res.body);
    expect(parsed.every(r => r.type === 'info' && r.status === 'approved')).toBe(true);
  });
});
