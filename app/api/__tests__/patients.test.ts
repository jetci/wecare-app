import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../patients/route'; // Assuming POST is also in this file
import * as patientIdRoute from '../patients/[id]/route'; // For PUT and DELETE
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
    default: {
        patient: {
            findMany: vi.fn(),
            count: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            create: vi.fn(),
        },
        $transaction: vi.fn().mockImplementation(async (fns) => {
            const results = [];
            for (const fn of fns) {
                results.push(await fn);
            }
            return results;
        }),
    },
}));

vi.mock('@/lib/auth', () => ({
    verifyAuth: vi.fn(),
}));

const mockCommunityUser = { userId: 'community-user-id', role: 'COMMUNITY' };
const mockAdminUser = { userId: 'admin-user-id', role: 'ADMIN' };

describe('Patient API', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // --- GET /api/patients --- //
    describe('GET /api/patients', () => {
        it('should return paginated patients for an admin user', async () => {
            (verifyAuth as vi.Mock).mockResolvedValue(mockAdminUser);
            (prisma.patient.findMany as vi.Mock).mockResolvedValue([{ id: '1', name: 'Patient 1' }]);
            (prisma.patient.count as vi.Mock).mockResolvedValue(1);

            const req = new NextRequest('http://localhost/api/patients?page=1&limit=10');
            const response = await GET(req);
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.data).toHaveLength(1);
            expect(body.meta.total).toBe(1);
            expect(prisma.patient.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: {},
                skip: 0,
                take: 10
            }));
        });

        it('should return only managed patients for a community user', async () => {
            (verifyAuth as vi.Mock).mockResolvedValue(mockCommunityUser);
            (prisma.patient.findMany as vi.Mock).mockResolvedValue([]);
            (prisma.patient.count as vi.Mock).mockResolvedValue(0);

            const req = new NextRequest('http://localhost/api/patients');
            await GET(req);

            expect(prisma.patient.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { managedByUserId: mockCommunityUser.userId },
            }));
        });

        it('should handle search query correctly', async () => {
            (verifyAuth as vi.Mock).mockResolvedValue(mockAdminUser);
            (prisma.patient.findMany as vi.Mock).mockResolvedValue([]);
            (prisma.patient.count as vi.Mock).mockResolvedValue(0);

            const req = new NextRequest('http://localhost/api/patients?search=test');
            await GET(req);

            expect(prisma.patient.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: {
                    OR: [
                        { firstName: { contains: 'test', mode: 'insensitive' } },
                        { lastName: { contains: 'test', mode: 'insensitive' } },
                        { nationalId: { contains: 'test', mode: 'insensitive' } },
                    ]
                },
            }));
        });
    });

    // --- PUT /api/patients/[id] --- //
    describe('PUT /api/patients/[id]', () => {
        const mockPatient = { id: 'patient-1', managedByUserId: 'community-user-id' };
        const reqBody = { firstName: 'Updated' }; // Simplified body

        it('should allow admin to update any patient', async () => {
            (verifyAuth as vi.Mock).mockResolvedValue(mockAdminUser);
            (prisma.patient.findUnique as vi.Mock).mockResolvedValue(mockPatient);
            (prisma.patient.update as vi.Mock).mockResolvedValue({ ...mockPatient, ...reqBody });

            const req = new NextRequest('http://localhost/api/patients/patient-1', {
                method: 'PUT',
                body: JSON.stringify(reqBody)
            });

            // Mocking schema validation to be successful
            const { patientFormSchema } = await import('@/schemas/community/patient.schema');
            patientFormSchema.safeParse = vi.fn().mockReturnValue({ success: true, data: reqBody });

            const response = await patientIdRoute.PUT(req, { params: { id: 'patient-1' } });
            expect(response.status).toBe(200);
            expect(prisma.patient.update).toHaveBeenCalled();
        });

        it('should return 403 if community user tries to update another user\'s patient', async () => {
            (verifyAuth as vi.Mock).mockResolvedValue(mockCommunityUser);
            (prisma.patient.findUnique as vi.Mock).mockResolvedValue({ ...mockPatient, managedByUserId: 'another-user-id' });

            const req = new NextRequest('http://localhost/api/patients/patient-1', {
                method: 'PUT',
                body: JSON.stringify(reqBody)
            });
            const response = await patientIdRoute.PUT(req, { params: { id: 'patient-1' } });
            expect(response.status).toBe(403);
        });

        it('should return 404 if patient not found', async () => {
            (verifyAuth as vi.Mock).mockResolvedValue(mockAdminUser);
            (prisma.patient.findUnique as vi.Mock).mockResolvedValue(null);

            const req = new NextRequest('http://localhost/api/patients/patient-nonexistent', {
                method: 'PUT',
                body: JSON.stringify(reqBody)
            });
            const response = await patientIdRoute.PUT(req, { params: { id: 'patient-nonexistent' } });
            expect(response.status).toBe(404);
        });
    });

    // --- DELETE /api/patients/[id] --- //
    describe('DELETE /api/patients/[id]', () => {
        const mockPatient = { id: 'patient-1', managedByUserId: 'community-user-id' };

        it('should allow admin to delete any patient', async () => {
            (verifyAuth as vi.Mock).mockResolvedValue(mockAdminUser);
            (prisma.patient.findUnique as vi.Mock).mockResolvedValue(mockPatient);

            const req = new NextRequest('http://localhost/api/patients/patient-1', { method: 'DELETE' });
            const response = await patientIdRoute.DELETE(req, { params: { id: 'patient-1' } });
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.success).toBe(true);
            expect(prisma.patient.delete).toHaveBeenCalledWith({ where: { id: 'patient-1' } });
        });

        it('should return 403 if community user tries to delete another user\'s patient', async () => {
            (verifyAuth as vi.Mock).mockResolvedValue(mockCommunityUser);
            (prisma.patient.findUnique as vi.Mock).mockResolvedValue({ ...mockPatient, managedByUserId: 'another-user-id' });

            const req = new NextRequest('http://localhost/api/patients/patient-1', { method: 'DELETE' });
            const response = await patientIdRoute.DELETE(req, { params: { id: 'patient-1' } });
            expect(response.status).toBe(403);
        });
    });
});
