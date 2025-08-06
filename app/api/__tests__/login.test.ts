import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/login/route';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn(),
  },
}));

vi.mock('jose', () => ({
    SignJWT: vi.fn().mockImplementation(() => ({
        setProtectedHeader: vi.fn().mockReturnThis(),
        setIssuedAt: vi.fn().mockReturnThis(),
        setExpirationTime: vi.fn().mockReturnThis(),
        sign: vi.fn().mockResolvedValue('mock-jwt-token'),
    })),
}));

// Helper to create a mock Request object
const createMockRequest = (body: any) => {
  return {
    json: async () => body,
  } as Request;
};

describe('API /api/login', () => {

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should login successfully and return tokens with valid credentials', async () => {
    const mockLoginData = {
      nationalId: '1234567890123',
      password: 'password123',
    };
    const mockUser = {
        id: 'user-id-123',
        nationalId: '1234567890123',
        password: 'hashed_password',
        firstName: 'ทดสอบ',
        lastName: 'ระบบ',
        role: 'COMMUNITY',
    };

    (prisma.user.findUnique as vi.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as vi.Mock).mockResolvedValue(true);

    const request = createMockRequest(mockLoginData);
    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { nationalId: mockLoginData.nationalId } });
    expect(bcrypt.compare).toHaveBeenCalledWith(mockLoginData.password, mockUser.password);
    expect(responseBody).toHaveProperty('accessToken');
    expect(responseBody.user.id).toBe(mockUser.id);
    expect(response.cookies.get('refreshToken')).toBeDefined();
  });

  it('should return 401 for non-existent user', async () => {
    const mockLoginData = {
        nationalId: '0000000000000',
        password: 'password123',
      };

    (prisma.user.findUnique as vi.Mock).mockResolvedValue(null);

    const request = createMockRequest(mockLoginData);
    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(401);
    expect(responseBody.error).toBe('รหัสประชาชนหรือรหัสผ่านไม่ถูกต้อง');
  });

  it('should return 401 for incorrect password', async () => {
    const mockLoginData = {
        nationalId: '1234567890123',
        password: 'wrong_password',
      };
      const mockUser = {
        id: 'user-id-123',
        nationalId: '1234567890123',
        password: 'hashed_password',
        role: 'COMMUNITY',
    };

    (prisma.user.findUnique as vi.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as vi.Mock).mockResolvedValue(false);

    const request = createMockRequest(mockLoginData);
    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(401);
    expect(responseBody.error).toBe('รหัสประชาชนหรือรหัสผ่านไม่ถูกต้อง');
  });

  it('should return 400 for invalid input data', async () => {
    const mockLoginData = {
        nationalId: '123',
        password: 'pass',
      };

    const request = createMockRequest(mockLoginData);
    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody.error).toBe('ข้อมูลไม่ถูกต้อง');
  });
});
