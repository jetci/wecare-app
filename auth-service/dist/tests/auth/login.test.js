"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../../src/index"));
describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/auth/login')
            .send({ nationalId: '1234567890123', password: 'password' })
            .expect(200);
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body.user).toMatchObject({ id: '1', role: 'COMMUNITY' });
        const cookies = res.headers['set-cookie'];
        expect(cookies).toEqual(expect.arrayContaining([expect.stringMatching(/refreshToken=/)]));
    });
    it('should return 400 for invalid nationalId format', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/auth/login')
            .send({ nationalId: '123', password: 'password' })
            .expect(400);
        expect(res.body).toHaveProperty('error', 'รหัส 13 หลักเท่านั้น');
    });
    it('should return 401 for wrong password', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .post('/api/auth/login')
            .send({ nationalId: '1234567890123', password: 'wrongpass' })
            .expect(401);
        expect(res.body).toHaveProperty('error', 'user หรือ password ไม่ถูกต้อง');
    });
});
//# sourceMappingURL=login.test.js.map