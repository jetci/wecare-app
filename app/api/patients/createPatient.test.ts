import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPatient } from './route';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Mock Prisma patient methods
vi.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    patient: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

const mockFind = (result: any) => {
  (prisma.patient.findUnique as unknown as vi.Mock).mockResolvedValue(result);
};
const mockCreate = (result: any) => {
  (prisma.patient.create as unknown as vi.Mock).mockResolvedValue(result);
};

const makeReq = (body: any) => ({ json: async () => body } as unknown as any);
const session = { userId: 'u1', role: 'COMMUNITY' };

describe('createPatient API', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should create patient for valid payload', async () => {
    const validBody = {
      fullName: 'Test User',
      hospitalNumber: 'H123',
      nationalId: '1234567890123',
      birthDate: '01-01-2568',
      allergies: [],
      chronicDiseases: [],
      emergencyContact: { name: 'EC', phone: '0123456789' },
      prefix: 'นาย',
      firstName: 'Test',
      lastName: 'User',
      gender: 'ชาย',
      bloodType: 'A',
      idCardAddress_houseNumber: '1',
      idCardAddress_moo: '2',
      idCardAddress_phone: '0123456789',
      idCardAddress_tambon: 'T',
      idCardAddress_amphoe: 'A',
      idCardAddress_changwat: 'C',
      useIdCardAddress: false,
      currentAddress_houseNumber: '3',
      currentAddress_moo: '4',
      currentAddress_tambon: 'T',
      currentAddress_amphoe: 'A',
      currentAddress_changwat: 'C',
      currentAddress_phone: '0987654321',
      patientGroup: 'ผู้ยากไร้',
      otherPatientGroup: '',
      pickupLocation_lat: 0,
      pickupLocation_lng: 0,
      notes: '',
    };
    mockFind(null);
    mockCreate({ id: 'p1', ...validBody, birthDate: new Date() });

    const resp = await createPatient(makeReq(validBody), {} as any, session);
    expect(resp.status).to.equal(201);
    const data = await resp.json();
    expect(data.success).to.be.true;
    expect(data.patient.id).to.equal('p1');
  });

  it('should return 400 for invalid date format', async () => {
    const body = { nationalId: '1234567890123', birthDate: '2025-01-01' }; // wrong format
    const resp = await createPatient(makeReq(body), {} as any, session);
    expect(resp.status).to.equal(400);
    const err = await resp.json();
    expect(err.error).to.equal('Invalid input data');
    expect(err.details.fieldErrors.birthDate[0]).to.match(/dd-MM-yyyy/);
  });

  it('should return 400 for birth year < 2500', async () => {
    const body = { nationalId: '1234567890123', birthDate: '01-01-2499' };
    const resp = await createPatient(makeReq(body), {} as any, session);
    expect(resp.status).to.equal(400);
  });

  it('should return 409 for duplicate nationalId', async () => {
    const body = {
      fullName: 'Test User',
      hospitalNumber: 'H123',
      nationalId: '1234567890123',
      birthDate: '01-01-2568',
      allergies: [],
      chronicDiseases: [],
      emergencyContact: { name: 'EC', phone: '0123456789' },
      prefix: 'นาย', firstName: 'Test', lastName: 'User', gender: 'ชาย', bloodType: 'A',
      idCardAddress_houseNumber: '1', idCardAddress_moo: '2', idCardAddress_phone: '0123456789',
      idCardAddress_tambon: 'T', idCardAddress_amphoe: 'A', idCardAddress_changwat: 'C',
      useIdCardAddress: false, currentAddress_houseNumber: '3', currentAddress_moo: '4',
      currentAddress_tambon: 'T', currentAddress_amphoe: 'A', currentAddress_changwat: 'C',
      currentAddress_phone: '0987654321', patientGroup: 'ผู้ยากไร้', otherPatientGroup: '',
      pickupLocation_lat: 0, pickupLocation_lng: 0, notes: '',
    };
    mockFind({ id: 'existing' });
    const resp = await createPatient(makeReq(body), {} as any, session);
    expect(resp.status).to.equal(409);
    const err = await resp.json();
    expect(err.error).to.match(/มีผู้ป่วยรหัสประชาชนนี้ในระบบแล้ว/);
  });
});
