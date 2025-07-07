import '@testing-library/jest-dom/vitest';
import request from 'supertest';
import app from '../../src/index';

describe('POST /api/auth/login', () => {
  it('should login successfully with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ nationalId: '1234567890123', password: 'password' })
      .expect(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.user).toMatchObject({ id: '1', role: 'COMMUNITY' });
    const cookies = res.headers['set-cookie'];
    expect(cookies).toEqual(
      expect.arrayContaining([expect.stringMatching(/refreshToken=/)])
    );
  });

  it('should return 400 for invalid nationalId format', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ nationalId: '123', password: 'password' })
      .expect(400);
    expect(res.body).toHaveProperty('error', 'รหัส 13 หลักเท่านั้น');
  });

  it('should return 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ nationalId: '1234567890123', password: 'wrongpass' })
      .expect(401);
    expect(res.body).toHaveProperty('error', 'user หรือ password ไม่ถูกต้อง');
  });
});

