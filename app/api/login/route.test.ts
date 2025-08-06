import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/login/route';
import { NextRequest } from 'next/server';

describe('/api/login', () => {

    async function mockRequest(body: any) {
        const request = new Request('http://localhost/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        return request as NextRequest;
    }

    it('should return 400 if nationalId is not 13 characters', async () => {
        const req = await mockRequest({ nationalId: '123456789012', password: 'password123' });
        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error.issues[0].message).toBe('รหัสประชาชนต้องมี 13 หลัก');
    });

    it('should return 400 if password is not provided', async () => {
        const req = await mockRequest({ nationalId: '1234567890123' });
        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error.issues[0].message).toBe('กรุณาป้อนรหัสผ่าน');
    });

    it('should return 400 if nationalId is not provided', async () => {
        const req = await mockRequest({ password: 'password123' });
        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error.issues[0].message).toBe('รหัสประชาชนต้องมี 13 หลัก');
    });

});
