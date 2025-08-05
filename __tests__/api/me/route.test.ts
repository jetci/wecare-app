import { NextRequest } from 'next/server';
import { GET } from '@/app/api/me/route';
import { PrismaClient } from '@prisma/client';
import * as jose from 'jose';

// Mock Prisma and Jose libraries
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),
    },
  })),
}));

jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
}));

describe('GET /api/me', () => {
  let prisma: any;
  let mockJwtVerify: jest.Mock;

  beforeEach(() => {
    prisma = new PrismaClient();
    mockJwtVerify = jose.jwtVerify as jest.Mock;
    jest.clearAllMocks();
  });

  // Helper to create a mock NextRequest
  const createMockRequest = (token?: string) => {
    const headers = new Headers();
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return new NextRequest('http://localhost/api/me', { headers });
  };

  it('should return 401 if no token is provided', async () => {
    const request = createMockRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.message).toBe('Authentication required');
  });

  it('should return 401 for an invalid or expired token', async () => {
    mockJwtVerify.mockRejectedValue(new Error('JWTExpired'));
    const request = createMockRequest('invalid-token');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.message).toContain('Authentication error');
  });

  it('should return 404 if the user is not found in the database', async () => {
    mockJwtVerify.mockResolvedValue({ payload: { userId: 'non-existent-user' } });
    prisma.user.findUnique.mockResolvedValue(null);
    
    const request = createMockRequest('valid-token');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.message).toBe('User not found');
  });

  it('should return the user data on successful authentication', async () => {
    const mockUser = {
      id: 'user-123',
      nationalId: '1234567890123',
      firstName: 'Test',
      lastName: 'User',
      role: 'DEVELOPER',
    };

    mockJwtVerify.mockResolvedValue({ payload: { userId: mockUser.id, role: 'DEVELOPER' } });
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const request = createMockRequest('valid-token-for-user-123');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockUser);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: mockUser.id },
      select: {
        id: true,
        nationalId: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });
  });
});
