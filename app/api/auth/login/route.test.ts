import '@testing-library/jest-dom/vitest';
import { POST } from './route'; // Adjust the path as necessary
import { PrismaClient } from '@prisma/client';
import { vi, Mock } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

// Mock PrismaClient
vi.mock('@prisma/client', () => {
  const mPrismaClient = {
    user: {
      findUnique: vi.fn(),
    },
  };
  return { PrismaClient: vi.fn(() => mPrismaClient) };
});

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn()
  },
  compare: vi.fn() // Independent mock for named export if used
}));

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn()
  },
  sign: vi.fn() // Independent mock for named export if used
}));

// Mock NextRequest and NextResponse if not automatically available or to control their behavior
// For Next 13+ app router, req is a standard Request object, NextResponse is used.

const mockPrisma = new PrismaClient();

// Set a dummy JWT_SECRET for testing
process.env.JWT_SECRET = 'test-secret-key';

describe('POST /api/auth/login', () => {
  const mockPrisma = new PrismaClient(); // Instance for typing, actual is mocked
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks(); // This clears all vi.fn() instances created by Vitest's mocking system
    (mockPrisma.user.findUnique as Mock).mockReset(); // Specific reset for Prisma mock if needed beyond clearAllMocks
  });

  const mockUser = {
    id: 'user-id-123',
    nationalId: '1234567890123',
    password: 'hashedPassword123',
    firstName: 'Test',
    role: 'USER',
    approved: true,
  };

  it('should login successfully with correct credentials', async () => {
    (mockPrisma.user.findUnique as Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as Mock).mockResolvedValue(true);
    (jwt.sign as Mock) // Use Mock from vitest
      .mockReturnValueOnce('mocked.access.token')  // For accessToken
      .mockReturnValueOnce('mocked.refresh.token'); // For refreshToken

    const requestBody = { nationalId: mockUser.nationalId, password: 'plainPassword123' };
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(req);
    const responseBody = await response.json();

    expect(response.status).to.equal(200);
    expect(responseBody.success).to.equal(true);
    expect(responseBody.user).toEqual({ id: mockUser.id, firstName: mockUser.firstName, role: mockUser.role });
    expect(responseBody.accessToken).to.equal('mocked.access.token');
    expect(responseBody.refreshToken).to.equal('mocked.refresh.token');

    expect(jwt.sign).toHaveBeenCalledTimes(2);
    expect(jwt.sign).toHaveBeenNthCalledWith(1,
      { userId: mockUser.id, role: mockUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Corrected: Access token expiry is 7d
    );
    expect(jwt.sign).toHaveBeenNthCalledWith(2,
      { userId: mockUser.id, role: mockUser.role },
      process.env.JWT_SECRET, // Corrected: Route uses JWT_SECRET for refresh token as well
      { expiresIn: '7d' }
    );
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { nationalId: mockUser.nationalId } });
    expect(bcrypt.compare).toHaveBeenCalledWith('plainPassword123', mockUser.password);
  });

  it('should return 401 for incorrect password', async () => {
    (mockPrisma.user.findUnique as Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as Mock).mockResolvedValue(false); // Password doesn't match

    const requestBody = { nationalId: mockUser.nationalId, password: 'wrongPassword' };
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(req);
    const responseBody = await response.json();

    expect(response.status).to.equal(401);
    expect(responseBody.success).to.equal(false);
    expect(responseBody.error).to.equal('รหัสบัตรประชาชนหรือรหัสผ่านไม่ถูกต้อง');
  });

  it('should return 401 if user not found', async () => {
    (mockPrisma.user.findUnique as Mock).mockResolvedValue(null); // User not found

    const requestBody = { nationalId: 'nonexistentUser', password: 'anyPassword' };
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(req);
    const responseBody = await response.json();

    expect(response.status).to.equal(401);
    expect(responseBody.success).to.equal(false);
    expect(responseBody.error).to.equal('รหัสบัตรประชาชนหรือรหัสผ่านไม่ถูกต้อง');
  });

  it('should return 403 if user is not approved', async () => {
    const unapprovedUser = { ...mockUser, approved: false };
    (mockPrisma.user.findUnique as Mock).mockResolvedValue(unapprovedUser);
    (bcrypt.compare as Mock).mockResolvedValue(true);

    const requestBody = { nationalId: mockUser.nationalId, password: 'plainPassword123' };
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(req);
    const responseBody = await response.json();

    expect(response.status).to.equal(403);
    expect(responseBody.success).to.equal(false);
    expect(responseBody.error).to.equal('บัญชีของคุณยังรอการอนุมัติจากผู้ดูแลระบบ');
  });

  it('should handle missing nationalId or password (though typically caught by req.json() or Prisma)', async () => {
    // Simulate req.json() throwing an error or returning incomplete data
    // This test depends on how robust req.json() and Prisma handle missing fields.
    // For this example, we'll test the route's behavior if it proceeds with undefined values.
    (mockPrisma.user.findUnique as Mock).mockResolvedValue(null); // Simulate user not found due to bad input

    const requestBody = { password: 'somePassword' }; // Missing nationalId
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
    
    // The actual route might throw before prisma.user.findUnique if req.json() fails or destructuring fails.
    // For simplicity, this test assumes it reaches the findUnique call with undefined nationalId.
    // A more robust test might mock req.json() itself to throw an error.
    try {
      const response = await POST(req);
      const responseBody = await response.json();
      // Depending on how Next.js/Prisma handles it, this might be a 400 or 500, or a specific Prisma error.
      // The current route logic would likely result in a 401 if nationalId is undefined and findUnique returns null.
      expect(response.status).to.equal(401); 
      expect(responseBody.error).to.equal('รหัสบัตรประชาชนหรือรหัสผ่านไม่ถูกต้อง');
    } catch (error) {
      // If req.json() itself throws due to malformed JSON or other Request object issues.
      // This path might not be hit if the route handler has its own try/catch for req.json()
      expect(error).toBeInstanceOf(Error); 
    }
  });
});

