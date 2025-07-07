import '@testing-library/jest-dom/vitest';
import request from 'supertest';
import app from '../../src/index';

describe('GET /api/auth/profile', () => {
  let token: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ nationalId: '1234567890123', password: 'password' });
    token = res.body.accessToken;
  });

  it('should return 200 and user profile with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toMatchObject({
      id: '1',
      prefix: 'นาย',
      firstName: 'Adam',
      lastName: 'Smith',
      nationalId: '1234567890123',
      phone: null,
      role: 'COMMUNITY',
      approved: true,
    });
  });

  it('should return 401 when no token provided', async () => {
    await request(app)
      .get('/api/auth/profile')
      .expect(401);
  });
});

