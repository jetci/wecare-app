import { NextRequest } from 'next/server';
import { GET, POST } from './route';

describe('Notifications API', () => {
  const makeReq = (tokenValue: string | undefined, body?: unknown): NextRequest => {
    return {
      cookies: { get: jest.fn(() => tokenValue ? { value: tokenValue } : undefined) },
      json: jest.fn(async () => body),
    } as unknown as NextRequest;
  };

  test('GET without token returns 401', async () => {
    const resp = await GET(makeReq(undefined));
    expect(resp.status).toBe(401);
  });

  test('GET with token returns notifications array', async () => {
    const resp = await GET(makeReq('token'));
    expect(resp.status).toBe(200);
    const data = await resp.json();
    expect(data).toEqual([]);
  });

  test('POST without token returns 401', async () => {
    const resp = await POST(makeReq(undefined));
    expect(resp.status).toBe(401);
  });

  test('POST with invalid body returns 400', async () => {
    const req = makeReq('token', {});
    const resp = await POST(req);
    expect(resp.status).toBe(400);
  });

  test('POST with valid body returns success', async () => {
    const req = makeReq('token', { message: 'hello' });
    const resp = await POST(req);
    expect(resp.status).toBe(200);
    const data = await resp.json();
    expect(data.success).toBe(true);
  });
});
