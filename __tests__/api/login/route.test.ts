import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/login/route';
import { NextRequest } from 'next/server';
import { createRequest } from 'node-mocks-http';

describe('/api/login', () => {

    it('should return 400 if nationalId is not 13 characters', async () => {
        const req = createRequest({
            method: 'POST',
            body: {
                nationalId: '123456789012',
                password: 'password123'
            }
        });

        const response = await POST(req as unknown as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('ข้อมูลไม่ถูกต้อง');
    });

    it('should return 400 if password is not provided', async () => {
        const req = createRequest({
            method: 'POST',
            body: {
                nationalId: '1234567890123',
            }
        });

        const response = await POST(req as unknown as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('ข้อมูลไม่ถูกต้อง');
    });

    it('should return 400 if nationalId is not provided', async () => {
        const req = createRequest({
            method: 'POST',
            body: {
                password: 'password123'
            }
        });

        const response = await POST(req as unknown as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('ข้อมูลไม่ถูกต้อง');
    });

    // Note: A test for a successful login would require mocking the database 
    // and other dependencies, which is beyond the current scope but should be implemented
    // in a full test suite.

});
