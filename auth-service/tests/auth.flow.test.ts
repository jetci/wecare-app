import '@testing-library/jest-dom/vitest';
import request from 'supertest';
import app from '../src/index';
import prisma from '../src/utils/prisma';
import { compare } from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe('Auth flow: login → refresh → logout', () => {
  const agent = request.agent(app);
  let refreshToken1: string;
  let refreshToken2: string;
  const mockUser = {
    id: '1',
    nationalId: '1234567890123',
    passwordHash: 'hashed-password',
    prefix: null,
    firstName: 'Foo',
    lastName: 'Bar',
    phone: null,
    role: 'COMMUNITY',
    approved: true,
  };

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (compare as jest.Mock).mockResolvedValue(true);

    (prisma.refreshToken.create as jest.Mock).mockImplementation(async ({ data }) => {
      refreshToken1 = data.token;
      return { id: '1', ...data };
    });
    (prisma.refreshToken.findUnique as jest.Mock).mockImplementation(async ({ where }) => {
      if (where.token === refreshToken1 || where.token === refreshToken2) {
        return { id: '1', token: where.token, userId: '1', expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), createdAt: new Date() };
      }
      return null;
    });
    (prisma.refreshToken.update as jest.Mock).mockImplementation(async ({ data }) => {
      refreshToken2 = data.token;
      return { id: '1', ...data };
    });
    (prisma.refreshToken.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
  });

  test('login sets refreshToken cookie and returns accessToken', async () => {
    const res = await agent.post('/api/auth/login').send({ nationalId: mockUser.nationalId, password: 'password' });
    expect(res.status).to.equal(200);
    expect(res.body).toHaveProperty('accessToken');
    const cookies = res.headers['set-cookie'] as string[];
    expect(cookies.some(c => c.startsWith('refreshToken='))).to.equal(true);
  });

  test('refresh issues new tokens', async () => {
    await agent.post('/api/auth/login').send({ nationalId: mockUser.nationalId, password: 'password' });
    const res = await agent.post('/api/auth/refresh');
    expect(res.status).to.equal(200);
    expect(res.body).toHaveProperty('accessToken');
    const cookies = res.headers['set-cookie'] as string[];
    expect(cookies.some(c => c.startsWith('refreshToken='))).to.equal(true);
  });

  test('logout clears refreshToken and subsequent refresh returns 401', async () => {
    await agent.post('/api/auth/login').send({ nationalId: mockUser.nationalId, password: 'password' });
    await agent.post('/api/auth/refresh');
    const logoutRes = await agent.post('/api/auth/logout');
    expect(logoutRes.status).to.equal(200);
    const refreshRes = await agent.post('/api/auth/refresh');
    expect(refreshRes.status).to.equal(401);
  });
});

