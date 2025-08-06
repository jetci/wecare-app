import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/register/route';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(),
  },
}));

// Helper to create a mock Request object
const createMockRequest = (body: any) => {
  return {
    json: async () => body,
  } as Request;
};

describe('API /api/register', () => {

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should create a new user successfully with valid data', async () => {
    const mockUserData = {
      prefix: 'นาย',
      firstName: 'ทดสอบ',
      lastName: 'ระบบ',
      nationalId: '1234567890123',
      password: 'password123',
    };

    (prisma.user.findUnique as vi.Mock).mockResolvedValue(null);
    (bcrypt.hash as vi.Mock).mockResolvedValue('hashed_password');
    (prisma.user.create as vi.Mock).mockResolvedValue({
      id: 'user-id-123',
      ...mockUserData,
      role: 'COMMUNITY',
      approved: false,
    });

    const request = createMockRequest(mockUserData);
    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(201);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { nationalId: mockUserData.nationalId } });
    expect(bcrypt.hash).toHaveBeenCalledWith(mockUserData.password, 10);
    expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ password: 'hashed_password' }) }));
    expect(responseBody).not.toHaveProperty('password');
    expect(responseBody.nationalId).toBe(mockUserData.nationalId);
  });

  it('should return 409 if nationalId already exists', async () => {
    const mockUserData = {
        prefix: 'นาย',
        firstName: 'ทดสอบ',
        lastName: 'ซ้ำ',
        nationalId: '1234567890123',
        password: 'password123',
      };

    (prisma.user.findUnique as vi.Mock).mockResolvedValue({ id: 'existing-user-id' });

    const request = createMockRequest(mockUserData);
    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(409);
    expect(responseBody.error).toBe('รหัสประชาชนนี้ถูกใช้งานแล้ว');
  });

  it('should return 400 for invalid input data', async () => {
    const mockUserData = {
        prefix: 'นาย',
        firstName: 'ทดสอบ',
        lastName: 'ข้อมูลผิด',
        nationalId: '123',
        password: 'pass',
      };

    const request = createMockRequest(mockUserData);
    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody.error).toBe('ข้อมูลไม่ถูกต้อง');
    expect(responseBody.details.fieldErrors).toHaveProperty('nationalId');
    expect(responseBody.details.fieldErrors).toHaveProperty('password');
  });
});
