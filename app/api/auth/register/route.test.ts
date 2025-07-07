import '@testing-library/jest-dom/vitest';
import { POST } from './route'; // Adjust path as necessary
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';

// Mock PrismaClient
vi.mock('@prisma/client', () => {
  const mPrismaClient = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  };
  return { PrismaClient: vi.fn(() => mPrismaClient) };
});

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  default: { // Assuming default import in route.ts, like login
    hash: vi.fn()
  },
  hash: vi.fn() // Also provide named export for robustness
}));

const mockPrisma = new PrismaClient();

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validUserData = {
    prefix: 'นาย',
    firstName: 'ทดสอบ',
    lastName: 'ผู้ใช้',
    nationalId: '1234567890123',
    password: 'password123',
    phone: '0812345678',
    role: 'COMMUNITY' as const,
  };

  const createdUserMock = {
    id: 'user-id-new',
    ...validUserData,
    password: 'hashedPassword',
    position: validUserData.role,
    approved: false,
    emailVerified: null,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should register a new user successfully', async () => {
    (mockPrisma.user.findUnique as Mock).mockResolvedValue(null); // No existing user
    (bcrypt.hash as Mock).mockResolvedValue('hashedPassword');
    (mockPrisma.user.create as Mock).mockResolvedValue(createdUserMock);

    // Prepare userSafe for comparison, ensuring dates are in ISO string format like the API response
    const { password, createdAt, updatedAt, ...restOfUser } = createdUserMock;
    const userSafe = {
      ...restOfUser,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    };

    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(validUserData),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(req);
    const responseBody = await response.json();

    expect(response.status).to.equal(200);
    expect(responseBody.success).to.equal(true);
    expect(responseBody.user).toEqual(userSafe); // Ensure password is not returned
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { nationalId: validUserData.nationalId } });
    expect(bcrypt.hash).toHaveBeenCalledWith(validUserData.password, 10);
    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: {
        ...validUserData,
        password: 'hashedPassword',
        position: validUserData.role,
        approved: false,
      },
    });
  });

  it('should return 409 if nationalId already exists', async () => {
    (mockPrisma.user.findUnique as Mock).mockResolvedValue(createdUserMock); // User exists

    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(validUserData),
    });

    const response = await POST(req);
    const responseBody = await response.json();

    expect(response.status).to.equal(409);
    expect(responseBody.success).to.equal(false);
    expect(responseBody.error).to.equal('nationalId exists');
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });

  it('should return 400 for invalid nationalId format (Zod validation)', async () => {
    const invalidData = { ...validUserData, nationalId: '123' }; // Invalid nationalId
    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    });

    const response = await POST(req);
    const responseBody = await response.json();

    expect(response.status).to.equal(400);
    expect(responseBody.success).to.equal(false);
    expect(responseBody.error.fieldErrors.nationalId).to.include('เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก');
  });

  it('should return 400 for password too short (Zod validation)', async () => {
    const invalidData = { ...validUserData, password: 'short' }; // Password too short
    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    });

    const response = await POST(req);
    const responseBody = await response.json();

    expect(response.status).to.equal(400);
    expect(responseBody.success).to.equal(false);
    expect(responseBody.error.fieldErrors.password).to.include('String must contain at least 8 character(s)'); // Default Zod message
  });

  it('should return 400 for invalid phone format (Zod validation)', async () => {
    const invalidData = { ...validUserData, phone: 'abc' }; // Invalid phone
    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    });

    const response = await POST(req);
    const responseBody = await response.json();

    expect(response.status).to.equal(400);
    expect(responseBody.success).to.equal(false);
    expect(responseBody.error.fieldErrors.phone).to.include('เบอร์โทรศัพท์ต้องเป็นตัวเลขเท่านั้น');
  });

   it('should return 400 for missing required field (e.g., firstName)', async () => {
    const { firstName, ...incompleteData } = validUserData; 
    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(incompleteData),
    });

    const response = await POST(req);
    const responseBody = await response.json();

    expect(response.status).to.equal(400);
    expect(responseBody.success).to.equal(false);
    expect(responseBody.error.fieldErrors.firstName).to.include('Required'); // Default Zod message for missing required field
  });

  it('should return 400 for missing role', async () => {
    const { role, ...incompleteData } = validUserData;
    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(incompleteData),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await POST(req);
    const responseBody = await response.json();

    expect(response.status).to.equal(400);
    expect(responseBody.success).to.equal(false);
    expect(responseBody.error.fieldErrors.role).to.include('Required');
  });

  it('should return 400 for invalid role', async () => {
    const invalidRoleData = { ...validUserData, role: 'INVALID' as any };
    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(invalidRoleData),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await POST(req);
    const responseBody = await response.json();

    expect(response.status).to.equal(400);
    expect(responseBody.success).to.equal(false);
    // Should have an error for role
    expect(responseBody.error.fieldErrors).toHaveProperty('role');
    expect(responseBody.error.fieldErrors.role.length).toBeGreaterThan(0);
  });

  it('should handle unexpected errors during registration', async () => {
    (mockPrisma.user.findUnique as Mock).mockResolvedValue(null);
    (bcrypt.hash as Mock).mockResolvedValue('hashedPassword');
    (mockPrisma.user.create as Mock).mockRejectedValue(new Error('Database connection error'));

    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(validUserData),
    });

    const response = await POST(req);
    const responseBody = await response.json();

    expect(response.status).to.equal(500);
    expect(responseBody.success).to.equal(false);
    expect(responseBody.error).to.equal('Database connection error');
  });
});

